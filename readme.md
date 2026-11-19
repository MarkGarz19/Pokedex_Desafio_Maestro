# 🎮 Pokédex: Desafío Maestro

## 📖 Descripción

He creado **Pokédex: Desafío Maestro**, un juego de adivinar Pokémon utilizando HTML, CSS y JavaScript.

El objetivo es descubrir el nombre del Pokémon viendo solamente una pequeña parte de su imagen. También aparece una pista que indica de qué tipo es, por ejemplo: *«Es un Pokémon de tipo fuego y volador»*.

Quería hacer un juego sencillo, entretenido y que se pudiera utilizar tanto en el ordenador como en el móvil.

## 🎯 Cómo se juega

1. Primero elijo una generación de Pokémon o selecciono todas.
2. Aparece una pequeña parte de un Pokémon desconocido.
3. Tengo que pulsar letras para adivinar su nombre.
4. Si fallo una letra, pierdo uno de mis cinco corazones.
5. Si descubro el nombre completo, gano puntos.
6. Cuando termina la ronda, puedo ver la imagen completa del Pokémon y pasar al siguiente.

También he añadido un botón de pista que descubre una letra a cambio de 10 puntos.

## ✨ Características

- Pokémon de las nueve generaciones, desde Kanto hasta Paldea.
- Cinco corazones por ronda.
- Imágenes reales de Pokémon.
- Una pequeña zona visible de la imagen que cambia de posición.
- Pistas con los tipos de cada Pokémon.
- Teclado de letras para jugar desde el móvil.
- Sistema de puntos y récord personal.
- Reto perfecto para intentar acertar todos los Pokémon sin fallar.
- Diseño adaptable a diferentes tamaños de pantalla.
- Un pequeño catálogo de prueba si no se puede cargar la lista completa.

## 🛠️ Tecnologías utilizadas

He utilizado tres lenguajes para desarrollar el proyecto:

- **HTML:** para crear la estructura del juego, los botones, los corazones y los apartados de la página.
- **CSS:** para diseñar los colores, el círculo de la imagen, el teclado y la adaptación a móviles.
- **JavaScript:** para controlar las partidas, comprobar las letras, cargar los Pokémon y guardar las puntuaciones.

También utilizo **PokéAPI** para obtener información sobre los Pokémon y sus tipos.

## 📁 Archivos del proyecto

```text
Pokedex-Desafio-Maestro/
│
├── index.html
├── pokedex_misteriosa.css
├── pokedex_misteriosa.js
└── README.md
```

El archivo `index.html` contiene la página principal. Los archivos CSS y JavaScript contienen el diseño y el funcionamiento del juego.

## 🚀 Cómo ejecutar el juego

Para probar mi proyecto no necesito instalar ningún programa especial.

1. Descargo o guardo los archivos en una misma carpeta.
2. Abro el archivo `index.html` con un navegador, como Chrome o Safari.
3. Elijo la generación que quiero.
4. Empiezo a adivinar Pokémon.

**Importante:** necesito conexión a internet para cargar las imágenes y el catálogo completo de Pokémon.

## 🏆 Reto perfecto

He añadido un reto especial para hacer el juego más difícil.

Consiste en intentar acertar todos los Pokémon de una generación sin cometer errores. Si fallo una letra o salto una ronda sin resolverla, el progreso perfecto de esa generación vuelve a empezar.

Si consigo completarlo, aparece un mensaje especial felicitándome por ser el mejor entrenador Pokémon de esa región.

## 🎨 Diseño del juego

Para el diseño he elegido colores rojos, amarillos y oscuros, inspirados en la Pokédex.

Al principio había diseñado el círculo de la imagen como una Poké Ball, con una raya negra y un botón blanco en el centro. Después decidí quitarlos para que se viera mejor la pequeña parte del Pokémon.

También he intentado que los botones sean cómodos de pulsar desde un teléfono móvil.

## 💾 Guardado de datos

He utilizado `localStorage` de JavaScript para guardar los puntos, el récord, el catálogo descargado y el progreso del reto perfecto.

De esta manera, los datos pueden mantenerse cuando cierro y vuelvo a abrir el juego en el mismo navegador.

## 🔧 Posibles mejoras

En el futuro me gustaría seguir mejorando el juego. Algunas ideas que tengo son añadir efectos de sonido, nuevos modos de dificultad y más opciones de personalización.

## 📝 Conclusión

Con este proyecto he practicado cómo combinar HTML, CSS y JavaScript para crear un juego interactivo.

He aprendido a trabajar con botones, imágenes, eventos, funciones, almacenamiento del navegador y datos obtenidos de una API.

Mi objetivo era crear un juego de Pokémon que fuera fácil de entender, divertido y que tuviera un diseño propio.