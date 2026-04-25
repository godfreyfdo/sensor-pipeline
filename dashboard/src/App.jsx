import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import axios from 'axios'

const API = 'https://05xerakx51.execute-api.us-east-1.amazonaws.com/prod'
const DEVICES = ['dev-001','dev-002','dev-003','dev-004','dev-005']
const THRESHOLD = 35

export default function App() {
  const [data, setData] = useState({})
  const [selected, setSelected] = useState('dev-001')

  useEffect(() => {
    const poll = async () => {
      const results = await Promise.all(
        DEVICES.map(id =>
          axios.get(`${API}/readings/${id}?limit=20`)
            .then(r => [id, r.data])
            .catch(() => [id, []])
        )
      )
      setData(Object.fromEntries(results))
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [])

  const readings = (data[selected] || []).map(r => ({
    time: new Date(parseInt(r.timestamp)).toLocaleTimeString(),
    temp: parseFloat(r.temperature),
    humidity: parseFloat(r.humidity)
  })).reverse()

  const alerts = Object.entries(data).flatMap(([id, rows]) =>
    (rows || []).filter(r => parseFloat(r.temperature) > THRESHOLD)
      .map(r => ({ ...r, deviceId: id }))
  )

  return (
    <div style={{fontFamily:'sans-serif',padding:'24px',background:'#0f1117',minHeight:'100vh',color:'#fff'}}>
      <h1 style={{marginBottom:'8px'}}>Sensor Pipeline Dashboard</h1>
      <p style={{color:'#888',marginBottom:'24px'}}>Live — polling every 5s</p>

      <div style={{display:'flex',gap:'10px',marginBottom:'24px',flexWrap:'wrap'}}>
        {DEVICES.map(id => {
          const last = (data[id] || [])[0]
          const temp = last ? parseFloat(last.temperature) : null
          const alert = temp > THRESHOLD
          return (
            <div key={id} onClick={() => setSelected(id)} style={{
              padding:'14px 20px',borderRadius:'10px',cursor:'pointer',minWidth:'130px',
              background: selected===id ? '#1e90ff22' : '#1a1d27',
              border: `1px solid ${alert?'#ff4444':selected===id?'#1e90ff':'#2a2d3a'}`
            }}>
              <div style={{fontWeight:600,marginBottom:'4px'}}>{id}</div>
              <div style={{color: alert?'#ff4444':'#4ade80',fontSize:'22px',fontWeight:700}}>
                {temp !== null ? `${temp}°C` : '—'}
              </div>
              <div style={{color:'#888',fontSize:'12px'}}>
                {alert ? '⚠ ALERT' : 'normal'}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{background:'#1a1d27',borderRadius:'12px',padding:'20px',marginBottom:'24px'}}>
        <h2 style={{marginBottom:'16px',fontSize:'16px'}}>{selected} — temperature over time</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={readings}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a"/>
            <XAxis dataKey="time" stroke="#888" tick={{fontSize:11}}/>
            <YAxis stroke="#888" tick={{fontSize:11}} domain={['auto','auto']}/>
            <Tooltip contentStyle={{background:'#1a1d27',border:'1px solid #2a2d3a'}}/>
            <Line type="monotone" dataKey="temp" stroke="#1e90ff" dot={false} strokeWidth={2}/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {alerts.length > 0 && (
        <div style={{background:'#ff444411',border:'1px solid #ff4444',borderRadius:'12px',padding:'20px'}}>
          <h2 style={{color:'#ff4444',marginBottom:'12px',fontSize:'16px'}}>⚠ Alerts ({alerts.length})</h2>
          {alerts.slice(0,5).map((a,i) => (
            <div key={i} style={{padding:'8px 0',borderBottom:'1px solid #ff444422',fontSize:'13px'}}>
              {a.deviceId} — {a.temperature}°C at {new Date(parseInt(a.timestamp)).toLocaleTimeString()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}