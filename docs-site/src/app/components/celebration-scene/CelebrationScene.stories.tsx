import type {Meta,StoryObj} from '@storybook/react'
import {CelebrationScene} from '@refraction-ui/react-celebration-scene'
const meta:Meta<typeof CelebrationScene>={title:'Feedback/CelebrationScene',component:CelebrationScene,args:{scene:'heart-bloom'}}
export default meta
export const HeartBloom:StoryObj<typeof CelebrationScene>={}
export const Still:StoryObj<typeof CelebrationScene>={args:{animate:false}}
export const Rocket:StoryObj<typeof CelebrationScene>={args:{scene:'rocket'}}
