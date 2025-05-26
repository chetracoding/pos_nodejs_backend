import Jwt from 'jsonwebtoken'

export default function verifyToken(req, res, next) {
  const token = req.headers['x-access-token']
  if (!token) {
    res.status(401)
    res.send({ success: false, message: 'Missing key (x-access-token) for authentication.' })
    return
  }
  try {
    const decode = Jwt.verify(token, 'TOKEN-KEY')
    req.user = decode
  } catch (error) {
    return res.status(401).send({ success: false, message: 'Invalid (x-access-token).' })
  }
  return next()
}
