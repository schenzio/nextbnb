import Cookies from "cookies";
export default async (req, res) =>{
  const cookies = new Cookies(req, res)
  cookies.set('nextbnb_session', '')
  res.end(JSON.stringify({ status: 'success', message: 'Logged out' }))
}