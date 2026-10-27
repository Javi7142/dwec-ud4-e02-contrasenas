// E02 · Demostración. No modifiques este fichero.
import { generarContrasena, evaluarFuerza, crearAleatorioConSemilla } from './contrasenas.js';

// Con una semilla fija, las contraseñas de la demostración son siempre las mismas
const aleatorio = crearAleatorioConSemilla(2025);

for (const opciones of [
  {},
  { longitud: 16, simbolos: true },
  { longitud: 6, mayusculas: false, numeros: false },
]) {
  const contrasena = generarContrasena(opciones, aleatorio);
  console.log(
    `🔑 ${contrasena.padEnd(16)} · ${contrasena.length} caracteres · ${evaluarFuerza(contrasena)}`,
  );
}

for (const ejemplo of ['abc', 'abcdefghijkl', 'abcdefgh1', 'Abcdefgh1234!']) {
  console.log(`🧪 ${ejemplo.padEnd(16)} · ${evaluarFuerza(ejemplo)}`);
}

console.log(`🎲 Con crypto: ${generarContrasena({ longitud: 20 }).length} caracteres`);

try {
  generarContrasena({ longitud: 3 });
} catch (error) {
  console.log(`❌ ${error.name}: ${error.message}`);
}
