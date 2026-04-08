// ============================================================
// Vitalink — Configuration
// Change ANY value here and it reflects across ALL pages.
// ============================================================

export const doctors = [
  { name: 'Dr. Emily Carter', specialty: 'General Medicine', rating: 4.9, reviews: 234, initials: 'EC' },
  { name: 'Dr. Michael Kim', specialty: 'Cardiology', rating: 4.8, reviews: 189, initials: 'MK' },
  { name: 'Dr. Aisha Patel', specialty: 'Dermatology', rating: 4.9, reviews: 312, initials: 'AP' },
]

export const testimonials = [
  { name: 'Robert Chen', text: 'Booking appointments has never been easier. The telemedicine feature saved me a trip to the clinic.', rating: 5 },
  { name: 'Maria Santos', text: 'I love being able to see my lab results online. The portal is intuitive and the doctors are very responsive.', rating: 5 },
  { name: 'David Thompson', text: 'Outstanding care from Dr. Carter. The follow-up process through the portal is seamless.', rating: 4 },
]

export const appointments = [
  { doctor: 'Dr. Emily Carter', specialty: 'General Medicine', date: 'Apr 10, 2026', time: '10:00 AM', type: 'In-person' },
  { doctor: 'Dr. Michael Kim', specialty: 'Cardiology', date: 'Apr 15, 2026', time: '2:30 PM', type: 'Telemedicine' },
  { doctor: 'Dr. Aisha Patel', specialty: 'Dermatology', date: 'Apr 22, 2026', time: '11:00 AM', type: 'In-person' },
]

export const labResults = [
  { name: 'Complete Blood Count', date: 'Apr 2, 2026', status: 'Normal', urgent: false },
  { name: 'Lipid Panel', date: 'Mar 28, 2026', status: 'Review needed', urgent: true },
  { name: 'Metabolic Panel', date: 'Mar 28, 2026', status: 'Normal', urgent: false },
]

export const specialties = ['General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics', 'Neurology', 'Pediatrics']

export const doctorsBySpecialty: Record<string, { name: string; rating: number; available: boolean; initials: string }[]> = {
  'General Medicine': [
    { name: 'Dr. Emily Carter', rating: 4.9, available: true, initials: 'EC' },
    { name: 'Dr. John Rivera', rating: 4.7, available: true, initials: 'JR' },
  ],
  'Cardiology': [
    { name: 'Dr. Michael Kim', rating: 4.8, available: true, initials: 'MK' },
    { name: 'Dr. Laura Hayes', rating: 4.6, available: false, initials: 'LH' },
  ],
  'Dermatology': [
    { name: 'Dr. Aisha Patel', rating: 4.9, available: true, initials: 'AP' },
  ],
  'Orthopedics': [
    { name: 'Dr. Robert Chang', rating: 4.8, available: true, initials: 'RC' },
  ],
  'Neurology': [
    { name: 'Dr. Sarah Mitchell', rating: 4.7, available: true, initials: 'SM' },
  ],
  'Pediatrics': [
    { name: 'Dr. James Foster', rating: 4.9, available: true, initials: 'JF' },
  ],
}

export const timeSlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM']

export const quickActions = [
            { label: 'Book Appointment', href: '/examples/vitalink/app/appointments', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg> },
            { label: 'Message Doctor', href: '/examples/vitalink/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg> },
            { label: 'View Records', href: '/examples/vitalink/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg> },
            { label: 'Prescriptions', href: '/examples/vitalink/app', icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg> },
          ]

export const services = [
              { title: 'General Checkup', desc: 'Routine health assessments and preventive care', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg> },
              { title: 'Specialist Consult', desc: 'Connect with board-certified specialists', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg> },
              { title: 'Lab Tests', desc: 'On-site and at-home lab testing services', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg> },
              { title: 'Telemedicine', desc: 'Video consultations from anywhere', icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg> },
            ]
