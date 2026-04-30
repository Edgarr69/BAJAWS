# Pendientes de seguridad — severidad ALTA

> Generado a partir de la auditoría de seguridad multi-agente del 2026-04-29.
> Las CRÍTICAS ya fueron corregidas. Estos hallazgos son ALTA severidad y se
> deben atender en la siguiente semana de trabajo.

---

## 1. CSP permite `unsafe-eval` en producción

**Archivo:** `next.config.ts:9`

**Problema:**
La directiva `script-src` incluye `'unsafe-eval'`. El comentario dice "Next.js
App Router requiere unsafe-inline / unsafe-eval para hidratación", pero esto
es incorrecto desde Next.js 13+. `unsafe-eval` solo se necesita en development.
En producción amplía la superficie de ataque XSS porque permite que un script
inyectado ejecute código arbitrario vía `eval()` / `new Function()`.

**Vector:**
Si un atacante consigue inyectar un script (XSS), `unsafe-eval` le permite
eludir CSP ejecutando código JS dinámico (deobfuscación, exfiltración).

**Fix recomendado:**
Quitar `'unsafe-eval'` del `script-src` en producción. Si el build falla,
condicionarlo a `process.env.NODE_ENV === 'development'`.

```ts
"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
```

**Verificación post-fix:**
- `npm run build` sin errores
- `npm run dev` no muestra warnings de CSP
- En producción: Lighthouse / SecurityHeaders.com debe subir el grado del CSP

---

## 2. CSP `connect-src` con wildcard `*.supabase.co`

**Archivo:** `next.config.ts:20`

**Problema:**
```
connect-src 'self' https://*.supabase.co ...
```
Permite peticiones fetch/XHR a CUALQUIER proyecto Supabase. Si hay un XSS,
el atacante puede exfiltrar datos a su propio proyecto Supabase (ej.
`attacker-project.supabase.co`) y CSP no lo bloquea.

**Vector:**
Combinado con cualquier XSS, exfiltración total de datos del usuario a un
endpoint Supabase controlado por el atacante.

**Fix recomendado:**
Reemplazar el wildcard por la URL exacta del proyecto:

```ts
"connect-src 'self' https://<tu-project-id>.supabase.co ..."
```

Tomar el ID de `NEXT_PUBLIC_SUPABASE_URL`. Construir el CSP dinámicamente si
hace falta para mantener una sola fuente de verdad.

---

## 3. `/api/me` usa `getAdminClient()` (service role) innecesariamente

**Archivo:** `src/app/api/me/route.ts:10`

**Problema:**
El endpoint que devuelve el perfil del usuario autenticado usa el cliente
admin (service role key) que bypasa RLS. Aunque la query filtra por
`session.userId`, viola el principio de menor privilegio: cualquier bug
futuro o confusión con otra ruta podría leakear datos de otros usuarios.

**Vector:**
Defensa en profundidad. Sin RLS, un bug en `session.userId` (race condition,
session fixation) podría permitir leer perfiles ajenos. Con RLS activo, la
base de datos es la última línea de defensa.

**Fix recomendado:**
Cambiar a `createClient()` (con cookies del usuario) y dejar que las RLS
policies de `profiles` validen el acceso.

```ts
const supabase = await createClient();
const { data, error } = await supabase
  .from('profiles')
  .select('id, email, full_name, role')
  .eq('id', session.userId)
  .single();
```

Verificar que la policy de `profiles` permita `SELECT` cuando `auth.uid() = id`.

---

## 4. Enumeración de códigos en `/api/public/form`

**Archivo:** `src/app/api/public/form/route.ts`

**Problema:**
El endpoint diferencia entre estados con HTTP status distintos:
- `404 INVALID` — código no existe
- `410 EXPIRED` — código existió pero caducó
- `409 USED` — código ya fue usado

Un atacante con varias IPs puede enumerar códigos válidos analizando los
status codes. Una respuesta `410` o `409` confirma que el código existió.

**Vector:**
Enumeración masiva de códigos válidos. El espacio es 32^8 ~ 1.1 billones
pero con botnet + diferentes status confirmando "este existió" se reduce
drásticamente la búsqueda comparado con random brute force.

**Fix recomendado:**
Devolver siempre `404` con cuerpo genérico para los tres casos. Mantener
los códigos de error internos (`INVALID` / `EXPIRED` / `USED`) en logs
server-side para debugging, pero al cliente solo `404`.

```ts
// En vez de status diferenciado, siempre 404
return NextResponse.json(
  { error: 'INVALID', message: 'Código inválido o ya utilizado' },
  { status: 404 }
);
```

---

## 5. Errores de Supabase expuestos al cliente en `set-role`

**Archivo:** `src/app/api/admin/users/set-role/route.ts:81`

**Problema:**
```ts
return serverError(updateError.message);
```
Filtra el mensaje crudo de Supabase al cliente, que puede incluir nombres
de columnas, constraints, esquemas, etc. — útil para reconocimiento previo
a un ataque.

**Vector:**
Information disclosure. Atacante con rol admin puede provocar errores DB
intencionalmente (ej. mandar campos malformados) y leer la estructura
interna de la BD para refinar otros ataques.

**Fix recomendado:**
Loguear internamente con `console.error`, retornar mensaje genérico al
cliente:

```ts
console.error('[set-role] update failed:', updateError);
return serverError('No se pudo actualizar el rol');
```

Aplicar el mismo patrón en TODOS los `serverError(error.message)` del
proyecto. Buscar con `grep -rn "serverError(.*\.message)" src/`.

---

## 6. Rate limit in-memory ineficaz en Vercel serverless

**Archivo:** `src/lib/rate-limit.ts`

**Problema:**
Ya documentado en `CLAUDE.md` como pendiente conocido. El store es un `Map`
en memoria por proceso. En Vercel serverless cada request puede caer en
una instancia diferente con su propio Map en cero — el rate limit es
trivialmente bypasseable distribuyendo requests.

**Vector:**
Spam masivo del formulario de contacto y submissions. No daña datos pero
satura logs, BD y posiblemente costos de Supabase.

**Fix recomendado:**
Migrar a Upstash Redis con `@upstash/ratelimit`:

```bash
npm i @upstash/ratelimit @upstash/redis
```

Crear cuenta gratuita en upstash.com, agregar variables de entorno
`UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`. Reemplazar el
contenido de `src/lib/rate-limit.ts` por la versión basada en Redis.

**Prioridad real:** Baja mientras el tráfico sea bajo. Subir prioridad
si se detecta spam o si se ejecuta una campaña de marketing.

---

## 7. Sin auditoría en operaciones destructivas

**Archivos afectados:**
- `src/app/api/admin/autorizaciones/[id]/route.ts` (DELETE)
- `src/app/api/admin/questions/[id]/route.ts` (DELETE)
- `src/app/api/admin/users/[id]/route.ts` (DELETE)

**Problema:**
Solo `set-role` escribe a la tabla `audit_log`. El resto de operaciones
destructivas (eliminar usuarios, autorizaciones, preguntas) ocurren sin
registro. Imposible hacer forensics si un superadmin/admin elimina datos
maliciosa o accidentalmente.

**Vector:**
Compliance + insider threat. No hay forma de saber quién borró qué ni
cuándo.

**Fix recomendado:**
Antes de cada DELETE, leer el registro y luego insertar en `audit_log`:

```ts
const { data: prev } = await admin.from('autorizaciones')
  .select('*').eq('id', id).single();

if (!prev) return notFound();

await admin.from('autorizaciones').delete().eq('id', id);

await admin.from('audit_log').insert({
  actor_id: session.userId,
  action: 'delete',
  table_name: 'autorizaciones',
  record_id: id,
  old_data: prev,
});
```

Considerar mover esto a un trigger PostgreSQL para no depender del código.

---

## 8. RPC `submit_feedback` — validar `question_id` pertenece al `form_id`

**Archivos:**
- `supabase/migrations/*.sql` (definición del RPC)
- `src/app/api/public/submit/route.ts` (consumer)

**Problema:**
El cliente envía un array de respuestas con `question_id` para un código
específico. El RPC debe verificar que cada `question_id` pertenezca al
formulario asociado al código. Sin esta validación, un atacante con un
código válido podría inyectar respuestas a preguntas de otra forma.

**Vector:**
Corrupción de datos. No hay impacto directo en confidencialidad pero sí en
integridad de las métricas/reportes.

**Fix recomendado:**
Revisar la definición de `submit_feedback` en `supabase/migrations/`. Si
no valida la relación question→form, agregarla:

```sql
-- Dentro del RPC, antes del INSERT
IF EXISTS (
  SELECT 1 FROM unnest(p_answers) a
  WHERE a.question_id NOT IN (
    SELECT id FROM questions WHERE form_id = v_form_id
  )
) THEN
  RETURN jsonb_build_object('error', 'INVALID_QUESTION');
END IF;
```

---

## 9. Validación de UUID/ID inconsistente en endpoints `[id]`

**Archivos:**
- `src/app/api/admin/autorizaciones/[id]/route.ts` (PUT, DELETE)
- `src/app/api/admin/users/[id]/route.ts` (DELETE)

**Problema:**
`users/set-role` valida con `z.string().uuid()`. Otros endpoints `[id]`
pasan el parámetro directo a Supabase sin validación. Resultado:
errores 500 internos en lugar de 400 explícitos, y queries inútiles a la BD.

**Vector:**
DoS menor (queries inútiles), información leak via mensajes de error 500.

**Fix recomendado:**
Centralizar la validación en un helper:

```ts
// src/lib/validation.ts
import { z } from 'zod';
const uuidSchema = z.string().uuid();
export function parseUuid(id: string | undefined): string | null {
  const r = uuidSchema.safeParse(id);
  return r.success ? r.data : null;
}
```

Usar en cada endpoint `[id]`:

```ts
const id = parseUuid(params.id);
if (!id) return badRequest('ID inválido');
```

---

## 10. `next` con versionado `^` permite minor upgrades automáticos

**Archivo:** `package.json`

**Problema:**
`"next": "^15.5.x"` permite que `npm install` instale 15.6.0, 15.7.0... sin
revisión. Un patch de Next.js puede introducir regresión de seguridad o de
comportamiento.

**Vector:**
Cadena de suministro. Bug introducido por upstream se propaga a producción
sin que nadie revise el changelog.

**Fix recomendado:**
Pinear a versión exacta:

```json
"next": "15.5.15"
```

Y configurar dependabot/renovate para PRs con upgrades semanales que
requieran revisión humana.

---

## Checklist

- [x] 1. Quitar `unsafe-eval` del CSP
- [x] 2. Reemplazar wildcard `*.supabase.co` por URL exacta
- [ ] 3. Migrar `/api/me` a `createClient()` con RLS — **BLOQUEADO**: verificar policy SELECT en tabla `profiles` (Dashboard → Authentication → Policies) con `USING (auth.uid() = id)` antes de cambiar
- [x] 4. Devolver 404 genérico en `/api/public/form` para todos los estados
- [x] 5. Sanitizar mensajes de error — `serverError()` ya era seguro por diseño (loguea internamente, retorna genérico al cliente). No requería cambio.
- [ ] 6. Migrar rate limit a Upstash Redis (cuando escale tráfico)
- [x] 7. Auditoría en DELETE de autorizaciones, questions, users
- [ ] 8. Verificar RPC `submit_feedback` valida question→form — **PENDIENTE MANUAL**: la migración no está en el repo local. Verificar en Supabase Dashboard → Database → Functions → `submit_feedback`.
- [x] 9. Helper `parseUuid()` aplicado en `autorizaciones/[id]` y `users/[id]`
- [x] 10. `next` pineado a `15.5.15` en `package.json`

---

## Notas adicionales — severidad MEDIA / BAJA

No se incluyen en este documento por prioridad. Si se quiere un seguimiento
completo, ejecutar de nuevo la auditoría con agentes paralelos.

Hallazgos descartados como falsos positivos durante la auditoría:
- `.env.local` en git (verificado: NO está trackeado)
- Cookies sin httpOnly/secure (verificado: Supabase ssr lib lo setea)
- XSS almacenado en panel (verificado: no hay `dangerouslySetInnerHTML`)
- `requireRole` no jerárquico (es diseño intencional, no bug)
