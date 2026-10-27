import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  generarContrasena,
  evaluarFuerza,
  numeroAleatorio,
  crearAleatorioConSemilla,
  MINUSCULAS,
  MAYUSCULAS,
  NUMEROS,
  SIMBOLOS,
} from '../src/contrasenas.js';

const contiene = (texto, grupo) => [...texto].some((caracter) => grupo.includes(caracter));

describe('generarContrasena', () => {
  it('tiene 12 caracteres por defecto', () => {
    expect(generarContrasena({}, crearAleatorioConSemilla(1))).toHaveLength(12);
  });

  it.each([4, 128])('acepta la longitud límite %i', (longitud) => {
    expect(generarContrasena({ longitud }, crearAleatorioConSemilla(1))).toHaveLength(longitud);
  });

  it.each([3, 129, 0, -5, 12.5, '12', NaN])(
    'lanza un RangeError con la longitud no válida %s',
    (longitud) => {
      expect(() => generarContrasena({ longitud })).toThrow(RangeError);
      expect(() => generarContrasena({ longitud })).toThrow('Longitud no válida');
    },
  );

  it('incluye un carácter de cada tipo por defecto, incluso con un azar que siempre devuelve 0', () => {
    const contrasena = generarContrasena({}, () => 0);
    expect(contiene(contrasena, MINUSCULAS)).toBe(true);
    expect(contiene(contrasena, MAYUSCULAS)).toBe(true);
    expect(contiene(contrasena, NUMEROS)).toBe(true);
    expect(contiene(contrasena, SIMBOLOS)).toBe(false);
  });

  it('incluye un símbolo cuando se piden, incluso con un azar que siempre devuelve 0', () => {
    const contrasena = generarContrasena({ longitud: 4, simbolos: true }, () => 0);
    expect(contiene(contrasena, SIMBOLOS)).toBe(true);
    expect(contrasena).toHaveLength(4);
  });

  it('con un azar que siempre devuelve 0 y 4 caracteres tiene exactamente uno de cada grupo', () => {
    const contrasena = generarContrasena({ longitud: 4, simbolos: true }, () => 0);
    expect([...contrasena].sort()).toEqual([...'aA0!'].sort());
  });

  it('con un azar casi 1 (el valor más alto posible) no se sale de los grupos', () => {
    const contrasena = generarContrasena({ longitud: 20, simbolos: true }, () => 0.9999999);
    expect(contrasena).toHaveLength(20);
    expect(
      [...contrasena].every((c) => (MINUSCULAS + MAYUSCULAS + NUMEROS + SIMBOLOS).includes(c)),
    ).toBe(true);
  });

  it('sin mayúsculas, números ni símbolos usa solo minúsculas', () => {
    const contrasena = generarContrasena(
      { longitud: 30, mayusculas: false, numeros: false },
      crearAleatorioConSemilla(7),
    );
    expect([...contrasena].every((c) => MINUSCULAS.includes(c))).toBe(true);
  });

  it('con la misma semilla produce la misma contraseña', () => {
    const a = generarContrasena({ longitud: 16, simbolos: true }, crearAleatorioConSemilla(99));
    const b = generarContrasena({ longitud: 16, simbolos: true }, crearAleatorioConSemilla(99));
    expect(a).toBe(b);
  });

  it('con semillas distintas produce contraseñas distintas', () => {
    const a = generarContrasena({ longitud: 16 }, crearAleatorioConSemilla(1));
    const b = generarContrasena({ longitud: 16 }, crearAleatorioConSemilla(2));
    expect(a).not.toBe(b);
  });

  it('baraja el resultado: los obligatorios no quedan siempre al principio', () => {
    // Con el azar fijo a 0 el barajado sigue moviendo caracteres; se comprueba con varias semillas
    const primeras = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map(
        (semilla) => generarContrasena({ longitud: 8 }, crearAleatorioConSemilla(semilla))[0],
      ),
    );
    const todasMinusculas = [...primeras].every((c) => MINUSCULAS.includes(c));
    expect(todasMinusculas).toBe(false);
  });

  it('no usa Math.random', () => {
    const espia = vi.spyOn(Math, 'random');
    generarContrasena({ longitud: 20, simbolos: true }, crearAleatorioConSemilla(3));
    expect(espia).not.toHaveBeenCalled();
    espia.mockRestore();
  });
});

describe('numeroAleatorio', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('usa crypto.getRandomValues', () => {
    const espia = vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      array[0] = 2 ** 31; // la mitad del rango de un Uint32
      return array;
    });
    expect(numeroAleatorio()).toBe(0.5);
    expect(espia).toHaveBeenCalledTimes(1);
  });

  it('devuelve 0 con el entero más bajo y un valor menor que 1 con el más alto', () => {
    const espia = vi.spyOn(crypto, 'getRandomValues');
    espia.mockImplementationOnce((array) => {
      array[0] = 0;
      return array;
    });
    expect(numeroAleatorio()).toBe(0);
    espia.mockImplementationOnce((array) => {
      array[0] = 2 ** 32 - 1;
      return array;
    });
    expect(numeroAleatorio()).toBeLessThan(1);
  });

  it('generarContrasena con el azar por defecto llama a crypto.getRandomValues', () => {
    const espia = vi.spyOn(crypto, 'getRandomValues');
    generarContrasena({ longitud: 4 });
    expect(espia).toHaveBeenCalled();
  });
});

describe('crearAleatorioConSemilla', () => {
  it('produce siempre la misma secuencia para la misma semilla', () => {
    const a = crearAleatorioConSemilla(5);
    const b = crearAleatorioConSemilla(5);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('produce números en [0, 1)', () => {
    const aleatorio = crearAleatorioConSemilla(123);
    const numeros = Array.from({ length: 200 }, aleatorio);
    expect(numeros.every((n) => n >= 0 && n < 1)).toBe(true);
  });
});

describe('evaluarFuerza', () => {
  it.each([
    ['abcdefg', 'débil'], // 7 caracteres, un solo tipo: 0 puntos
    ['abcdefgh', 'débil'], // 8 caracteres: 1 punto
    ['abcdefghijk', 'débil'], // 11 caracteres: 1 punto
    ['abcdefghijkl', 'media'], // 12 caracteres: 2 puntos
    ['abcdefg1', 'media'], // 8 caracteres y dos tipos: 1 + 1
    ['Abcdef1', 'media'], // 7 caracteres y tres tipos: 0 + 2
    ['Abcde1!', 'media'], // 7 caracteres y cuatro tipos: 0 + 3 = 3 puntos
    ['Abcdefgh1234!', 'fuerte'], // 13 caracteres y cuatro tipos: 2 + 3
    ['', 'débil'],
  ])('«%s» es %s', (contrasena, esperado) => {
    expect(evaluarFuerza(contrasena)).toBe(esperado);
  });
});
