import { useNavigate } from 'react-router-dom'

import MeaningRushGame from '../features/games/meaning-rush/MeaningRushGame'

function StudentGamesPage() {
  const navigate = useNavigate()

  return (
    <main>
      <div
        style={{
          width: 'min(100%, 860px)',
          margin: '0 auto',
          padding: '18px 16px 0',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/student')}
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            padding: '10px 14px',
            background: '#0b1f38',
            color: '#f8fafc',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ← العودة إلى لوحة الطالب
        </button>
      </div>

      <MeaningRushGame />
    </main>
  )
}

export default StudentGamesPage