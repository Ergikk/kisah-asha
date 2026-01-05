const ADMIN_PASSWORDS = {
  main: 'tenderloinsteak',
  limited: 'peachtea'
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body

    let level = null
    if (password === ADMIN_PASSWORDS.main) {
      level = 'main'
    } else if (password === ADMIN_PASSWORDS.limited) {
      level = 'limited'
    }

    if (!level) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate a simple token
    const token = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    res.status(200).json({ token, level })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
