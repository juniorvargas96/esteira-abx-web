import {NextResponse} from 'next/server'; import {createHash,randomBytes} from 'crypto'; import {db} from '@/lib/db';
const sh=(s:string)=>createHash('sha256').update(s).digest('hex');
export async function POST(req:Request){try{const {login,senha}=await req.json(); if(!login||!senha)return NextResponse.json({error:'Informe usuário e senha.'},{status:400});
 const {rows}=await db().query(`SELECT id,nome,login,perfil,ativo FROM usuarios WHERE lower(login)=lower($1) AND senha=$2 AND ativo=1 LIMIT 1`,[String(login).trim(),sh(String(senha))]);
 const u=rows[0]; if(!u)return NextResponse.json({error:'Usuário ou senha inválidos.'},{status:401});
 const token=randomBytes(32).toString('hex'); const exp=new Date(Date.now()+30*86400000); await db().query('DELETE FROM login_sessions WHERE expira_em<$1',[new Date().toISOString().slice(0,19)]); await db().query('INSERT INTO login_sessions(token,usuario_id,expira_em) VALUES($1,$2,$3)',[token,u.id,exp.toISOString().slice(0,19)]);
 const r=NextResponse.json({ok:true,user:u}); r.cookies.set('abxon_session',token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',expires:exp}); return r;
 }catch(e){console.error(e);return NextResponse.json({error:'Falha ao conectar ao banco.'},{status:500})}}
