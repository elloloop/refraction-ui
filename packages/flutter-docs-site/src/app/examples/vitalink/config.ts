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

