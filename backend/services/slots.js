const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false },
});

/**
 * Generate available slots for next N days
 * @param {number} mentorId - Mentor ID
 * @param {number} daysAhead - How many days to generate slots for (default: 30)
 * @param {number} slotsPerDay - How many 45-min slots per day (default: 4)
 */
async function generateAvailableSlots(mentorId = 1, daysAhead = 30, slotsPerDay = 4) {
  const client = await pool.connect();
  
  try {
    const startDate = new Date();
    startDate.setHours(9, 0, 0, 0); // Start at 9 AM IST
    
    const slots = [];
    
    for (let day = 0; day < daysAhead; day++) {
      // Skip Sundays (0 = Sunday)
      if (startDate.getDay() === 0) {
        startDate.setDate(startDate.getDate() + 1);
        continue;
      }
      
      for (let slot = 0; slot < slotsPerDay; slot++) {
        const startTime = new Date(startDate);
        startTime.setHours(9 + slot, 0, 0, 0); // 9 AM, 10 AM, 11 AM, 12 PM
        
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + 45);
        
        slots.push({
          mentorId,
          startTime,
          endTime,
        });
      }
      
      startDate.setDate(startDate.getDate() + 1);
    }
    
    // Insert slots into database (ignore duplicates)
    for (const slot of slots) {
      try {
        await client.query(
          `INSERT INTO time_slots (mentor_id, start_time, end_time, is_booked)
           VALUES ($1, $2, $3, FALSE)
           ON CONFLICT DO NOTHING`,
          [slot.mentorId, slot.startTime, slot.endTime]
        );
      } catch (error) {
        // Continue on duplicate key errors
      }
    }
    
    console.log(`✅ Generated ${slots.length} available slots for mentor ${mentorId}`);
    return slots.length;
  } finally {
    client.release();
  }
}

/**
 * Get available slots for a mentor
 */
async function getAvailableSlots(mentorId = 1, limit = 20) {
  try {
    const result = await pool.query(
      `SELECT id, start_time, end_time 
       FROM time_slots 
       WHERE mentor_id = $1 AND is_booked = FALSE AND start_time > NOW()
       ORDER BY start_time ASC
       LIMIT $2`,
      [mentorId, limit]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      start_time: row.start_time,
      end_time: row.end_time,
      display: new Date(row.start_time).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return [];
  }
}

module.exports = {
  generateAvailableSlots,
  getAvailableSlots,
};
