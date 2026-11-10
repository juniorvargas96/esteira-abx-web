import {NextResponse} from 'next/server'; import {cookies} from 'next/headers'; import {db} from '@/lib/db';
export async function POST(){const c=await cookies();const t=c.get('abxon_session')?.value;if(t)await db().query('DELETE FROM login_sessions WHERE token=$1',[t]).catch(()=>{});const r=NextResponse.json({ok:true});r.cookies.set('abxon_session','',{path:'/',expires:new Date(0)});return r}
