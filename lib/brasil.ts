// Datas legadas de historico são gravadas como texto UTC sem sufixo Z.
export const hojeBrasil = () => (() => {const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const get=(type:string)=>parts.find(p=>p.type===type)?.value||'';return `${get('year')}-${get('month')}-${get('day')}`;})();
export const dataBrasil = (value: string | null | undefined) => {
  if (!value) return '—';
  const raw=String(value).trim();
  const iso=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)?raw:raw.replace(' ','T');
  const date=new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(iso)?iso:iso+'Z');
  return Number.isNaN(date.getTime())?raw:new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(date);
};
