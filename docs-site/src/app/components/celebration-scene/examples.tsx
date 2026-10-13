"use client"
import {useState} from 'react'
import {CelebrationScene,celebrationSceneStyles} from '@refraction-ui/react-celebration-scene'
export function CelebrationSceneExamples(){
 const [scene,setScene]=useState<typeof celebrationSceneStyles[number]>('heart-bloom')
 return <div className="space-y-4"><label>Scene <select value={scene} onChange={e=>setScene(e.target.value as typeof scene)}>{celebrationSceneStyles.map(s=><option key={s} value={s}>{s}</option>)}</select></label><CelebrationScene scene={scene}/><h3>Thank you for the careful review.</h3><p>The heading and real reason stay readable when motion is reduced.</p></div>
}
