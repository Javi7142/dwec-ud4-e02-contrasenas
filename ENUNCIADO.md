# E02 · Generador de contraseñas

**Tipo:** autocorrección

Programa un generador de contraseñas seguro con `Math` y `crypto`, y prueba con Vitest un código que depende del azar fijando ese azar en los tests.

**CE:** RA3 a, h

## Entorno de trabajo

Este ejercicio trae su Dev Container en `.devcontainer/`. Como los ejercicios de la UD2 con dependencias de npm, **construye su imagen** con el `Dockerfile` de esa carpeta, a partir de la imagen oficial de Node.js de **Docker Hub**, `node:24-bookworm` (UD2, tema 9, apartado 9.3.2). Abre en VS Code **la carpeta del ejercicio**, la que contiene `.devcontainer/` (no una carpeta superior, como la del repositorio del curso: VS Code solo busca el Dev Container en la carpeta que abres), y ejecuta **Dev Containers: Reopen in Container**. Si VS Code te ofrece crear una configuración nueva, es que has abierto otra carpeta. La primera vez tarda algo más, porque descarga la imagen y la construye. Al crearse, el contenedor ejecuta `npm install`: cuando se abre, las dependencias ya están instaladas.

Ejecuta los programas en la terminal de VS Code, que ya es la del contenedor.

## Punto de partida

```text
├── package.json          ← scripts start, test, lint, format y format:check
├── eslint.config.js
├── .prettierrc
├── src/
│   ├── contrasenas.js    ← constantes, numeroAleatorio y crearAleatorioConSemilla hechas; dos funciones por programar
│   └── main.js           ← demostración (no se modifica)
└── tests/
    └── contrasenas.test.js ← un primer test
└── README.md             ← tu entrega
```

`numeroAleatorio()` usa `crypto.getRandomValues` (seguro). `crearAleatorioConSemilla(semilla)` devuelve una función que produce siempre la **misma** secuencia de números: no es segura, pero sirve para que la demostración y los tests den siempre el mismo resultado.

## Requisitos

1. `generarContrasena(opciones = {}, aleatorio = numeroAleatorio)`, según su JSDoc:
   - Desestructura las opciones con sus valores por defecto: `longitud = 12`, `mayusculas = true`, `numeros = true`, `simbolos = false`. Las minúsculas se usan siempre.
   - Lanza `RangeError('Longitud no válida: …')` si la longitud no es un entero entre 4 y 128.
   - **Garantiza** al menos un carácter de cada tipo pedido: elige primero uno de cada grupo y completa el resto con caracteres de todos los grupos.
   - **Baraja** el resultado (algoritmo de Fisher-Yates) para que los obligatorios no queden siempre al principio.
   - Todo el azar sale de la función `aleatorio` que recibe: **nunca** de `Math.random()`.
2. `evaluarFuerza(contrasena)`, con las reglas de su JSDoc: puntos por longitud y por variedad de tipos de caracteres.
3. Usa `Math.floor` para convertir el número en `[0, 1)` en una posición, y los métodos de `String` y de los arrays que necesites.
4. **Tests** (`tests/contrasenas.test.js`), al menos:
   - Longitud por defecto, longitudes límite (4 y 128) y longitudes no válidas (`toThrow`).
   - Que hay un carácter de cada tipo pedido incluso con un azar que **siempre devuelve 0** (`() => 0`).
   - Que la misma semilla produce la misma contraseña.
   - Que `numeroAleatorio` usa `crypto.getRandomValues`, con `vi.spyOn(crypto, 'getRandomValues').mockImplementation(…)`, deshaciendo el mock en un `afterEach`.
   - Una tabla `it.each` para `evaluarFuerza` con casos límite (7, 8, 11 y 12 caracteres).
5. `npm run lint` sin errores y código formateado.

**Entrega.** Completa el `README.md`: cómo ejecutarlo, la salida de `npm start`, la salida de `npm test` con lo que comprueba cada `describe`, qué test falla con el cambio de la última comprobación de abajo y la salida de ESLint y Prettier.

## Comprueba tu solución

- `npm start` muestra exactamente:

  ```text
  🔑 38TOY0amDKM4     · 12 caracteres · fuerte
  🔑 DxWT9rnnm*lxf0k& · 16 caracteres · fuerte
  🔑 xrirex           · 6 caracteres · débil
  🧪 abc              · débil
  🧪 abcdefghijkl     · media
  🧪 abcdefgh1        · media
  🧪 Abcdefgh1234!    · fuerte
  🎲 Con crypto: 20 caracteres
  ❌ RangeError: Longitud no válida: 3
  ```

- Si tus tres contraseñas son distintas de estas, pero con la misma longitud y fuerza, revisa el **orden** en que gastas números de `aleatorio`: primero uno por grupo obligatorio (en el orden minúsculas, mayúsculas, números, símbolos), después el resto y por último el barajado de Fisher-Yates desde el final. Cualquier otro orden es correcto, pero da otras contraseñas.
- La línea `🎲 Con crypto` dice `20 caracteres` y, si ejecutas varias veces `generarContrasena()` en la consola, cada vez sale una distinta.
- Busca `Math.random` en `contrasenas.js`: no debe aparecer.
- `npm test` pasa todos tus tests. Cambia temporalmente `longitud < 4` por `longitud < 3`: algún test debe fallar.

## Integración continua (opcional)

> 📝 Este apartado es **opcional** y no cuenta para la corrección. Hazlo si en clase habéis visto GitHub Actions; si no, sáltatelo.

Sube el proyecto a un repositorio tuyo de GitHub (el `.gitignore` ya deja fuera `node_modules/`). Escribe un *workflow* de GitHub Actions que pase **todas las comprobaciones del proyecto** cada vez que subas cambios. Es como el de la UD2, con una mejora: las dependencias se instalan con **`npm ci`** a partir de `package-lock.json`, el fichero que anota la versión exacta de cada paquete instalado. Así la integración continua usa las mismas versiones que tu contenedor, y con la caché de npm la instalación es más rápida. Escríbelo tú, en `.github/workflows/ci.yml`, con estas orientaciones:

- Se ejecuta con cada `push` y cada *pull request* a la rama `main`.
- Tiene un único trabajo (*job*) que se ejecuta en `ubuntu-latest`.
- Sus pasos, en este orden, cada uno con un nombre (`name`) en español que diga qué hace:
  1. Descargar el código, con la acción `actions/checkout@v7`.
  2. Instalar Node.js 24 con la caché de npm, con la acción `actions/setup-node@v7`, `node-version: 24` y `cache: npm`.
  3. Instalar las dependencias con `npm ci`.
  4. Revisar el código con ESLint: `npm run lint`.
  5. Comprobar el formato con Prettier: `npm run format:check`.
  6. Ejecutar los tests: `npm test`.
- Sube también `package-lock.json`: lo creó `npm install` al abrir el contenedor. Sin él, `npm ci` falla. Si añades o actualizas una dependencia, vuelve a subirlo.
- Prettier también revisa el formato de `ci.yml`: ejecuta `npm run format` antes de subirlo.

Compruébalo:

1. Sube los cambios y abre la pestaña **Actions** del repositorio: la ejecución debe salir en verde, con los seis pasos.
2. Rompe algo a propósito (por ejemplo, cambia la fuerza esperada de un caso de la tabla de `evaluarFuerza`), sube el cambio y comprueba que la ejecución sale en rojo en el paso que corresponde. Después, deshaz el cambio y comprueba que vuelve a verde.

Deja constancia en la sección «Integración continua (opcional)» del `README.md`: el enlace a la ejecución en verde y dos capturas en `img/`, una de la ejecución en verde con sus pasos y otra de la ejecución en rojo con el paso que falla.

## Al terminar

Cuando acabes la práctica, **borra su contenedor**. Si no, sigue en marcha ocupando memoria, y se acumula uno por cada ejercicio (UD1, tema 5, apartado 5.4.7). Tu trabajo no se borra: está en la carpeta del ejercicio.

1. Cierra la ventana de VS Code del ejercicio.
2. En una terminal de tu equipo (en Windows, PowerShell), borra todos los contenedores de Dev Containers. La orden solo toca los que ha creado VS Code, no otros contenedores que tengas:

   ```bash
   docker rm -f $(docker ps -aq --filter label=devcontainer.local_folder)
   ```

   Si no queda ninguno, Docker avisa de que le falta un argumento: puedes ignorarlo. También puedes borrarlos desde Docker Desktop, en la pestaña **Containers**.

La imagen que ha construido el `Dockerfile` tampoco se borra (se llama `vsc-` seguido del nombre de la carpeta), así que la próxima vez no hace falta construirla de nuevo. Si necesitas espacio, bórrala desde la pestaña **Images** de Docker Desktop o con `docker image rm <nombre>`.
