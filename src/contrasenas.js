/**
 * Generador de contraseñas y evaluación de su fuerza.
 *
 * El azar se recibe como parámetro (una función que devuelve un número en [0, 1)). Por defecto se
 * usa `crypto.getRandomValues`, que es seguro; en los tests y en la demostración se puede pasar
 * otro para que el resultado sea siempre el mismo.
 *
 * @module contrasenas
 */

export const MINUSCULAS = 'abcdefghijklmnopqrstuvwxyz';
export const MAYUSCULAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const NUMEROS = '0123456789';
export const SIMBOLOS = '!@#$%&*?-_';

/**
 * Número aleatorio seguro en [0, 1), obtenido con `crypto.getRandomValues`.
 * @returns {number}
 */
export function numeroAleatorio() {
  const [entero] = crypto.getRandomValues(new Uint32Array(1));
  return entero / 2 ** 32;
}

/**
 * Crea un generador de números en [0, 1) que siempre produce la misma secuencia para la misma
 * semilla. **No es seguro**: solo para demostraciones y pruebas.
 *
 * @param {number} semilla
 * @returns {function(): number}
 */
export function crearAleatorioConSemilla(semilla) {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado * 1664525 + 1013904223) >>> 0; // generador congruencial lineal
    return estado / 2 ** 32;
  };
}

/**
 * Genera una contraseña con al menos un carácter de cada tipo pedido.
 *
 * @param {object} [opciones]
 * @param {number} [opciones.longitud=12] Entre 4 y 128.
 * @param {boolean} [opciones.mayusculas=true]
 * @param {boolean} [opciones.numeros=true]
 * @param {boolean} [opciones.simbolos=false]
 * @param {function(): number} [aleatorio=numeroAleatorio] Fuente de azar.
 * @returns {string}
 * @throws {RangeError} Si la longitud no es un entero entre 4 y 128.
 * @example
 * generarContrasena({ longitud: 16, simbolos: true }); // 'k7#Qb…' (16 caracteres)
 */
export function generarContrasena(opciones = {}, aleatorio = numeroAleatorio) {
  const { longitud = 12, mayusculas = true, numeros = true, simbolos = false } = opciones;
  if (!Number.isInteger(longitud) || longitud < 4 || longitud > 128) {
    throw new RangeError(`Longitud no válida: ${longitud}`);
  }

  // Las minúsculas se usan siempre; los demás grupos, solo si se piden
  const grupos = [MINUSCULAS];
  if (mayusculas) grupos.push(MAYUSCULAS);
  if (numeros) grupos.push(NUMEROS);
  if (simbolos) grupos.push(SIMBOLOS);

  // Math.floor convierte el número en [0, 1) en una posición válida del texto
  const elegir = (texto) => texto[Math.floor(aleatorio() * texto.length)];

  // Un carácter de cada grupo pedido (en orden), para garantizar la variedad...
  const caracteres = grupos.map(elegir);
  // ...y el resto, de entre todos los caracteres permitidos
  const todos = grupos.join('');
  while (caracteres.length < longitud) {
    caracteres.push(elegir(todos));
  }

  // Barajado de Fisher-Yates desde el final, para que los obligatorios no queden siempre al principio
  for (let i = caracteres.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
  }
  return caracteres.join('');
}

/**
 * Evalúa la fuerza de una contraseña por su longitud y por los tipos de caracteres que usa.
 *
 * Puntos: 2 si tiene 12 caracteres o más, 1 si tiene de 8 a 11; más 1 por cada tipo de carácter
 * (minúsculas, mayúsculas, números, otros) a partir del segundo.
 *
 * @param {string} contrasena
 * @returns {'débil'|'media'|'fuerte'} `débil` con 0 o 1 puntos, `media` con 2 o 3, `fuerte` con 4 o más.
 */
export function evaluarFuerza(contrasena) {
  let puntos = 0;
  if (contrasena.length >= 12) puntos += 2;
  else if (contrasena.length >= 8) puntos += 1;

  const tipos = [
    /[a-z]/.test(contrasena),
    /[A-Z]/.test(contrasena),
    /[0-9]/.test(contrasena),
    /[^a-zA-Z0-9]/.test(contrasena),
  ].filter(Boolean).length;
  // 1 punto por cada tipo a partir del segundo
  puntos += Math.max(0, tipos - 1);

  if (puntos >= 4) return 'fuerte';
  if (puntos >= 2) return 'media';
  return 'débil';
}
