import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

const categories = ['Student', 'Worker', 'Athlete', 'Creator'];

const App = () => {
  const [userId, setUserId] = useState('');
  const [xp, setXp] = useState(0);
  const [quests, setQuests] = useState([]);
  const [category, setCategory] = useState('Student');
  const [name, setName] = useState('');

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('name');
    const storedCat = localStorage.getItem('category');

    if (storedId && storedName) {
      setUserId(storedId);
      setName(storedName);
      setCategory(storedCat || 'Student');
      fetchXP(storedId);
      fetchQuests(storedId);
    } else {
      const newId = uuidv4();
      localStorage.setItem('userId', newId);
      setUserId(newId);
    }
  }, []);

  const fetchXP = async (uid) => {
    const { data } = await supabase.from('users').select('xp').eq('id', uid).single();
    if (data) setXp(data.xp);
  };

  const fetchQuests = async (uid) => {
    const { data } = await supabase.from('quests').select('*').eq('user_id', uid);
    if (data) setQuests(data);
  };

  const completeQuest = async (qid, amount) => {
    await supabase.from('quests').delete().eq('id', qid);
    const newXp = xp + amount;
    setXp(newXp);
    setQuests(quests.filter(q => q.id !== qid));
    await supabase.from('users').upsert({ id: userId, xp: newXp });
  };

  const addQuest = async () => {
    const questText = prompt('Enter your quest');
    const amount = parseInt(prompt('XP reward?'), 10) || 10;
    const newQuest = { id: uuidv4(), user_id: userId, text: questText, xp: amount };
    await supabase.from('quests').insert(newQuest);
    setQuests([...quests, newQuest]);
  };

  const handleStart = async () => {
    localStorage.setItem('name', name);
    localStorage.setItem('category', category);
    await supabase.from('users').upsert({ id: userId, name, category, xp: 0 });
    fetchXP(userId);
    fetchQuests(userId);
  };

  if (!name) {
    return (
      <div className="container">
        <h1>Welcome to ShadowXP</h1>
        <input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => <option key={cat}>{cat}</option>)}
        </select>
        <button onClick={handleStart}>Enter World</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{name}'s ShadowXP</h1>
      <p>Category: {category}</p>
      <p>XP: {xp}</p>
      <button onClick={addQuest}>+ New Quest</button>
      <ul>
        {quests.map(q => (
          <li key={q.id}>
            {q.text} (+{q.xp} XP) <button onClick={() => completeQuest(q.id, q.xp)}>Complete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
