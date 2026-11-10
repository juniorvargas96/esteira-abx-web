import { cookies } from 'next/headers';
import { db } from './db';

export type SessionUser={id:number;nome:string;login:string;perfil:string;ativo:number};
export async function currentUser():Promise<SessionUser|null>{
 const token=(await cookies()).get('abxon_session')?.value;
 if(!token)return null;
 const {rows}=await db().query(`SELECT u.id,u.nome,u.login,u.perfil,u.ativo FROM login_sessions s JOIN usuarios u ON u.id=s.usuario_id WHERE s.token=$1 AND s.expira_em>$2 AND u.ativo=1`,[token,new Date().toISOString().slice(0,19)]);
 return rows[0]||null;
}
export function canManage(u:SessionUser|null){return !!u&&['ADMINISTRADOR','GESTOR'].includes(u.perfil)}
