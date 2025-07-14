import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('users')
        .select('name, xp, category')
        .order('xp', { ascending: false })
        .limit(20);
      setLeaders(data || []);
    };
    fetchLeaders();
  }, []);

  return (
    <div className="container">
      <h1>Leaderboard</h1>
      <ul>
        {leaders.map((user, index) => (
          <li key={index}>
            <strong>{index + 1}. {user.name}</strong> ({user.category}) — {user.xp} XP
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
