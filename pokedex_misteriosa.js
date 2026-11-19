
(() => {
  "use strict";

  // Para no tener que escribir document.getElementById todo el rato.
  const $ = (id) => document.getElementById(id);

  // Aquí tengo los números de cada generación en la Pokédex.
  const generaciones = [
    [1, 151],
    [152, 251],
    [252, 386],
    [387, 493],
    [494, 649],
    [650, 721],
    [722, 809],
    [810, 905],
    [906, 1025]
  ];

  const regiones = [
    "Kanto", "Johto", "Hoenn",
    "Sinnoh", "Teselia", "Kalos",
    "Alola", "Galar", "Paldea"
  ];

  const tipos = {
    normal: "normal",
    fire: "fuego",
    water: "agua",
    electric: "eléctrico",
    grass: "planta",
    ice: "hielo",
    fighting: "lucha",
    poison: "veneno",
    ground: "tierra",
    flying: "volador",
    psychic: "psíquico",
    bug: "bicho",
    rock: "roca",
    ghost: "fantasma",
    dragon: "dragón",
    dark: "siniestro",
    steel: "acero",
    fairy: "hada"
  };

  // Estos Pokémon sirven para probar el juego si no carga internet.
  const pokemonPrueba = [
    ["bulbasaur", 1],
    ["ivysaur", 2],
    ["venusaur", 3],
    ["charmander", 4],
    ["charmeleon", 5],
    ["charizard", 6],
    ["squirtle", 7],
    ["wartortle", 8],
    ["blastoise", 9],
    ["pikachu", 25],
    ["eevee", 133],
    ["mew", 151]
  ].map(([nombre, id]) => ({
    name: nombre,
    id: id
  }));

  // Algunos tipos guardados por si falla la API.
  const tiposSinInternet = {
    1: "planta y veneno",
    2: "planta y veneno",
    3: "planta y veneno",
    4: "fuego",
    5: "fuego",
    6: "fuego y volador",
    7: "agua",
    8: "agua",
    9: "agua",
    25: "eléctrico",
    133: "normal",
    151: "psíquico"
  };

  // ------------------------------------------
  // VARIABLES QUE USA EL JUEGO
  // ------------------------------------------

  let listaPokemon = pokemonPrueba;
  let pokemonActual = null;

  let letrasUsadas = new Set();
  let errores = 0;
  let rondaTerminada = false;

  let puntos = 0;
  let record = 0;

  let numeroRonda = 0;
  let pokemonAnterior = 0;

  let retoPerfecto = {};

  // Esto sirve para saber si una ronda sigue activa.
  // Así evitamos que una imagen antigua aparezca
  // cuando ya hemos pasado al siguiente Pokémon.
  let identificadorRonda = 0;

  // ------------------------------------------
  // GUARDAR Y RECUPERAR DATOS
  // ------------------------------------------

  function leerGuardado(clave, valorPorDefecto) {
    try {
      const valor = localStorage.getItem(clave);
      return valor === null ? valorPorDefecto : JSON.parse(valor);
    } catch (error) {
      return valorPorDefecto;
    }
  }

  function guardar(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
      // Si el navegador bloquea el guardado,
      // el juego puede seguir funcionando.
    }
  }

  puntos = leerGuardado("pokedex_desafio_score", 0);
  record = leerGuardado("pokedex_desafio_best", 0);

  retoPerfecto = leerGuardado(
    "pokedex_desafio_perfect",
    {}
  );

  // ------------------------------------------
  // GENERACIONES Y RETO PERFECTO
  // ------------------------------------------

  function generacionElegida() {
    return $("gen").value;
  }

  function pokemonCompletados() {
    const generacion = generacionElegida();

    if (!Array.isArray(retoPerfecto[generacion])) {
      retoPerfecto[generacion] = [];
    }

    return retoPerfecto[generacion];
  }

  function guardarRetoPerfecto() {
    guardar("pokedex_desafio_perfect", retoPerfecto);
  }

  function reiniciarRetoPerfecto() {
    const generacion = generacionElegida();

    // Si fallamos, hay que empezar el reto desde cero.
    retoPerfecto[generacion] = [];

    guardarRetoPerfecto();
    actualizarProgreso();
  }

  function actualizarProgreso() {
    const generacion = generacionElegida();

    let totalPokemon;

    if (generacion === "all") {
      totalPokemon = 1025;
    } else {
      const [primero, ultimo] =
        generaciones[Number(generacion) - 1];

      totalPokemon = ultimo - primero + 1;
    }

    const completados = pokemonCompletados().length;

    $("progress").textContent =
      "🏅 Reto perfecto: " +
      completados + " / " + totalPokemon +
      " Pokémon sin fallos";

    const retoTerminado = completados >= totalPokemon;

    $("victory").hidden = !retoTerminado;

    if (retoTerminado) {
      if (generacion === "all") {
        $("victory").textContent =
          "🏆 ¡Eres el mejor entrenador Pokémon " +
          "de la historia!";
      } else {
        const region =
          regiones[Number(generacion) - 1];

        $("victory").textContent =
          "🏆 ¡Eres el mejor entrenador Pokémon " +
          "de " + region + " de la historia!";
      }
    }
  }

  // ------------------------------------------
  // PUNTOS Y CORAZONES
  // ------------------------------------------

  function actualizarMarcador() {
    $("score").textContent = puntos;
    $("best").textContent = record;

    // El jugador empieza con cinco corazones.
    // Cada letra incorrecta hace desaparecer uno.
    const corazonesRestantes = Math.max(0, 5 - errores);

    $("hearts").textContent =
      Array(corazonesRestantes).fill("❤️").join(" ");

    $("hearts").setAttribute(
      "aria-label",
      corazonesRestantes + " corazones"
    );

    guardar("pokedex_desafio_score", puntos);
    guardar("pokedex_desafio_best", record);
  }

  // ------------------------------------------
  // FUNCIONES PEQUEÑAS QUE NECESITAMOS
  // ------------------------------------------

  function normalizar(texto) {
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }

  function letraValida(letra) {
    return /^[A-ZÑ]$/.test(letra);
  }

  function numeroAleatorio(maximo) {
    return Math.floor(Math.random() * maximo);
  }

  function obtenerPokemonDisponibles() {
    const generacion = generacionElegida();

    if (generacion === "all") {
      return listaPokemon;
    }

    const [primero, ultimo] =
      generaciones[Number(generacion) - 1];

    return listaPokemon.filter((pokemon) => {
      return pokemon.id >= primero &&
             pokemon.id <= ultimo;
    });
  }

  // ------------------------------------------
  // IMAGEN DEL POKÉMON
  // ------------------------------------------

  function cargarImagen(pokemon, ronda) {
    const imagen = $("sprite");

    imagen.hidden = true;
    imagen.removeAttribute("src");

    // Primero intento cargar la ilustración oficial.
    // Si falla, pruebo con otros sprites.
    const direcciones = [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" +
        pokemon.id + ".png",

      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
        pokemon.id + ".png",

      "https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/" +
        pokemon.id + ".png"
    ];

    let intento = 0;

    function probarImagen() {
      // Si hemos cambiado de ronda, ya no hace falta cargarla.
      if (ronda !== identificadorRonda) {
        return;
      }

      if (intento >= direcciones.length) {
        $("note").textContent =
          "No se ha podido cargar la imagen. " +
          "Comprueba tu conexión a internet.";

        return;
      }

      const direccion = direcciones[intento];
      intento++;

      const imagenTemporal = new Image();

      imagenTemporal.onload = () => {
        if (ronda !== identificadorRonda) {
          return;
        }

        imagen.src = direccion;
        imagen.hidden = false;

        $("note").textContent =
          "Imagen cargada correctamente.";
      };

      imagenTemporal.onerror = probarImagen;
      imagenTemporal.src = direccion;
    }

    probarImagen();
  }

  // ------------------------------------------
  // PISTA DEL TIPO DE POKÉMON
  // ------------------------------------------

  async function cargarTipo(pokemon, ronda) {
    const tipoGuardado = tiposSinInternet[pokemon.id];

    if (tipoGuardado) {
      $("info").textContent =
        "Es un Pokémon de tipo " +
        tipoGuardado + ".";
    } else {
      $("info").textContent =
        "Cargando tipo del Pokémon...";
    }

    try {
      const respuesta = await fetch(
        "https://pokeapi.co/api/v2/pokemon/" +
          pokemon.id
      );

      if (!respuesta.ok) {
        throw new Error("No se pudo cargar el tipo");
      }

      const datos = await respuesta.json();

      // Compruebo que seguimos en el mismo Pokémon.
      if (ronda !== identificadorRonda) {
        return;
      }

      const tiposPokemon = datos.types.map((dato) => {
        const nombreIngles = dato.type.name;

        return tipos[nombreIngles] || nombreIngles;
      });

      $("info").textContent =
        "Es un Pokémon de tipo " +
        tiposPokemon.join(" y ") + ".";

    } catch (error) {
      if (ronda !== identificadorRonda) {
        return;
      }

      $("info").textContent = tipoGuardado
        ? "Es un Pokémon de tipo " + tipoGuardado + "."
        : "No se ha podido cargar el tipo.";
    }
  }

  // ------------------------------------------
  // MOSTRAR SOLO UNA PARTE DEL POKÉMON
  // ------------------------------------------

  function cambiarZonaVisible() {
    const imagen = $("portrait");

    // Estos puntos están repartidos por la imagen.
    // Así no aparece siempre la cabeza o el centro.
    const posiciones = [
      [32, 29],
      [50, 28],
      [68, 30],
      [28, 48],
      [72, 48],
      [33, 67],
      [50, 72],
      [68, 67],
      [45, 43],
      [58, 58]
    ];

    const posicion =
      posiciones[numeroAleatorio(posiciones.length)];

    const tamaño = 22 + numeroAleatorio(7);

    imagen.style.setProperty(
      "--spot-x",
      posicion[0] + "%"
    );

    imagen.style.setProperty(
      "--spot-y",
      posicion[1] + "%"
    );

    imagen.style.setProperty(
      "--spot-radius",
      tamaño + "px"
    );
  }

  // ------------------------------------------
  // EMPEZAR UNA NUEVA RONDA
  // ------------------------------------------

  function nuevaRonda() {
    actualizarProgreso();

    const completados = pokemonCompletados();

    let disponibles = obtenerPokemonDisponibles()
      .filter((pokemon) => {
        return !completados.includes(pokemon.id);
      });

    // Si ya están todos completados, mostramos el premio.
    if (disponibles.length === 0 && completados.length > 0) {
      $("message").textContent =
        "🏆 ¡Has completado el reto! " +
        "Puedes elegir otra generación.";

      $("keyboard").replaceChildren();
      $("word").replaceChildren();

      $("portrait").classList.add("revealed");

      pokemonActual = null;
      return;
    }

    if (disponibles.length === 0) {
      disponibles = obtenerPokemonDisponibles();
    }

    if (disponibles.length === 0) {
      $("message").textContent =
        "No hay Pokémon disponibles. " +
        "Prueba con todas las generaciones.";

      pokemonActual = null;
      return;
    }

    let pokemon =
      disponibles[numeroAleatorio(disponibles.length)];

    // Intento que no salga dos veces seguidas el mismo.
    if (
      disponibles.length > 1 &&
      pokemon.id === pokemonAnterior
    ) {
      const posicion = disponibles.indexOf(pokemon);

      pokemon =
        disponibles[(posicion + 1) % disponibles.length];
    }

    pokemonAnterior = pokemon.id;
    pokemonActual = pokemon;

    // Reinicio todo lo que pertenece a esta ronda.
    letrasUsadas = new Set();
    errores = 0;
    rondaTerminada = false;
    numeroRonda++;

    identificadorRonda++;
    const ronda = identificadorRonda;

    $("portrait").classList.remove("revealed");
    $("hint").disabled = false;

    $("message").textContent =
      "Adivina el Pokémon. ¡Tienes cinco corazones!";

    $("info").textContent =
      "Cargando pista...";

    cambiarZonaVisible();
    cargarImagen(pokemon, ronda);
    cargarTipo(pokemon, ronda);

    mostrarJuego();
  }

  // ------------------------------------------
  // MOSTRAR LAS LETRAS DEL NOMBRE
  // ------------------------------------------

  function mostrarNombre() {
    const nombre = normalizar(pokemonActual.name);

    $("word").replaceChildren();

    for (const letra of nombre) {
      const casilla = document.createElement("div");

      const esLetra = letraValida(letra);

      casilla.className =
        esLetra ? "letter" : "letter sep";

      if (!esLetra) {
        // Los guiones separan palabras y no hay que adivinarlos.
        casilla.textContent =
          letra === "-" ? "" : letra;
      } else if (
        letrasUsadas.has(letra) ||
        rondaTerminada
      ) {
        casilla.textContent = letra;
      } else {
        casilla.textContent = "";
      }

      $("word").append(casilla);
    }
  }

  // ------------------------------------------
  // CREAR EL TECLADO
  // ------------------------------------------

  function mostrarTeclado() {
    $("keyboard").replaceChildren();

    const abecedario = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
    const nombre = normalizar(pokemonActual.name);

    for (const letra of abecedario) {
      const boton = document.createElement("button");

      boton.textContent = letra;
      boton.className = "key";

      if (letrasUsadas.has(letra)) {
        boton.classList.add(
          nombre.includes(letra) ? "good" : "bad"
        );
      }

      boton.disabled =
        rondaTerminada || letrasUsadas.has(letra);

      boton.addEventListener("click", () => {
        comprobarLetra(letra);
      });

      $("keyboard").append(boton);
    }
  }

  function mostrarJuego() {
    if (!pokemonActual) {
      return;
    }

    mostrarNombre();
    mostrarTeclado();
    actualizarMarcador();
  }

  // ------------------------------------------
  // COMPROBAR SI HEMOS ACERTADO EL POKÉMON
  // ------------------------------------------

  function nombreCompleto() {
    const nombre = normalizar(pokemonActual.name);

    return [...nombre].every((letra) => {
      return !letraValida(letra) ||
             letrasUsadas.has(letra);
    });
  }

  function terminarRonda(hemosGanado) {
    rondaTerminada = true;

    // Cuando termina la ronda ya podemos ver
    // la imagen completa del Pokémon.
    $("portrait").classList.add("revealed");
    $("hint").disabled = true;

    if (hemosGanado) {
      // Solo cuenta para el reto perfecto si
      // no hemos fallado ninguna letra.
      if (errores === 0) {
        const completados = pokemonCompletados();

        if (!completados.includes(pokemonActual.id)) {
          completados.push(pokemonActual.id);
          guardarRetoPerfecto();
        }

        actualizarProgreso();
      }

      const puntosGanados = 20 + (5 - errores) * 5;

      puntos += puntosGanados;
      record = Math.max(record, puntos);

      $("message").textContent =
        "🎉 ¡Correcto! Era " +
        pokemonActual.name.toUpperCase() +
        ". Has ganado " + puntosGanados + " puntos.";

    } else {
      $("message").textContent =
        "💔 Te has quedado sin corazones. Era " +
        pokemonActual.name.toUpperCase() + ".";
    }

    mostrarJuego();
  }

  // ------------------------------------------
  // COMPROBAR CADA LETRA QUE PULSAMOS
  // ------------------------------------------

  function comprobarLetra(letra) {
    if (
      !pokemonActual ||
      rondaTerminada ||
      letrasUsadas.has(letra)
    ) {
      return;
    }

    letrasUsadas.add(letra);

    const nombre = normalizar(pokemonActual.name);

    if (!nombre.includes(letra)) {
      // Si la letra no está en el nombre,
      // perdemos uno de los cinco corazones.
      errores++;

      // Un solo fallo rompe la racha perfecta.
      if (pokemonCompletados().length > 0) {
        reiniciarRetoPerfecto();
      }

      $("message").textContent =
        "❌ Esa letra no está. Has perdido un corazón.";
    }

    if (nombreCompleto()) {
      terminarRonda(true);
    } else if (errores >= 5) {
      terminarRonda(false);
    } else {
      mostrarJuego();
    }
  }

  // ------------------------------------------
  // BOTÓN PARA DESCUBRIR UNA LETRA
  // ------------------------------------------

  $("hint").addEventListener("click", () => {
    if (!pokemonActual || rondaTerminada) {
      return;
    }

    // La pista cuesta 10 puntos.
    puntos = Math.max(0, puntos - 10);

    const nombre = normalizar(pokemonActual.name);

    const letrasPendientes = [
      ...new Set(nombre)
    ].filter((letra) => {
      return letraValida(letra) &&
             !letrasUsadas.has(letra);
    });

    if (letrasPendientes.length > 0) {
      const letra =
        letrasPendientes[
          numeroAleatorio(letrasPendientes.length)
        ];

      comprobarLetra(letra);
    }

    $("hint").disabled = true;

    if (!rondaTerminada) {
      $("message").textContent =
        "💡 Has descubierto una letra.";
    }

    actualizarMarcador();
  });

  // ------------------------------------------
  // BOTONES DE LA PÁGINA
  // ------------------------------------------

  $("next").addEventListener("click", () => {
    // Saltarse una ronda sin resolverla
    // también rompe el reto perfecto.
    if (
      pokemonActual &&
      !rondaTerminada &&
      pokemonCompletados().length > 0
    ) {
      reiniciarRetoPerfecto();
    }

    nuevaRonda();
  });

  $("gen").addEventListener("change", () => {
    // Si cambiamos de generación, se cancela
    // la ronda anterior, pero conservamos los
    // progresos guardados de cada región.
    identificadorRonda++;

    pokemonActual = null;
    rondaTerminada = true;

    nuevaRonda();
  });

  // También se puede jugar con el teclado del ordenador.
  window.addEventListener("keydown", (evento) => {
    if (
      evento.target.tagName === "SELECT" ||
      evento.ctrlKey ||
      evento.metaKey ||
      evento.altKey
    ) {
      return;
    }

    const letra = normalizar(evento.key);

    if (letra.length === 1 && letraValida(letra)) {
      comprobarLetra(letra);
    }
  });

  // ------------------------------------------
  // CARGAR EL CATÁLOGO DE POKÉMON
  // ------------------------------------------

  async function cargarCatalogo() {
    // Primero miro si ya guardamos los nombres
    // anteriormente para no descargarlos otra vez.
    const guardados = leerGuardado(
      "pokedex_desafio_catalog",
      null
    );

    if (Array.isArray(guardados) && guardados.length > 100) {
      listaPokemon = guardados;
    } else {
      try {
        const respuesta = await fetch(
          "https://pokeapi.co/api/v2/pokemon-species?limit=1025"
        );

        if (!respuesta.ok) {
          throw new Error("No se pudo cargar el catálogo");
        }

        const datos = await respuesta.json();

        const pokemonDescargados = datos.results
          .map((pokemon) => {
            const coincidencia =
              pokemon.url.match(/\/(\d+)\/$/);

            return {
              name: pokemon.name,
              id: coincidencia
                ? Number(coincidencia[1])
                : 0
            };
          })
          .filter((pokemon) => {
            return pokemon.id >= 1 &&
                   pokemon.id <= 1025;
          });

        if (pokemonDescargados.length > 100) {
          listaPokemon = pokemonDescargados;

          guardar(
            "pokedex_desafio_catalog",
            pokemonDescargados
          );
        }

      } catch (error) {
        // Si no hay internet, seguimos usando
        // los Pokémon de prueba.
      }
    }

    if (listaPokemon.length > 100) {
      $("note").textContent =
        "Catálogo de " + listaPokemon.length +
        " Pokémon cargado correctamente.";
    } else {
      $("note").textContent =
        "Modo de prueba con 12 Pokémon. " +
        "Con internet podrás cargar el catálogo completo.";
    }

    // Si el jugador ya había empezado a jugar,
    // no quiero cambiarle el Pokémon a mitad de ronda.
    if (!pokemonActual) {
      nuevaRonda();
    }
  }

  // ------------------------------------------
  // ARRANCAR EL JUEGO
  // ------------------------------------------

  // Primero preparo el marcador y una ronda
  // de prueba. Después cargo los demás Pokémon.
  actualizarMarcador();
  nuevaRonda();
  cargarCatalogo();

})();
