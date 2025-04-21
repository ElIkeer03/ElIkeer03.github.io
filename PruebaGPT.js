document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    const container = document.querySelector(".container");
    const productosTbody = document.getElementById("productos");
    const inputBusqueda = document.getElementById("busqueda");
    const selectDimension = document.getElementById("dimensionSelect");
    const paginacion = document.getElementById("paginacion");

    let productos = [];
    let productosFiltrados = [];
    let paginaActual = 1;
    const productosPorPagina = 5;

    const focusMain = () => {
        container.setAttribute("tabindex", "-1");
        container.focus();
        container.removeAttribute("tabindex");
    };

    const mostrarProductos = () => {
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;
        const fragment = document.createDocumentFragment();
        productosTbody.innerHTML = "";

        const productosPagina = productosFiltrados.slice(inicio, fin);

        if (productosPagina.length === 0) {
            productosTbody.innerHTML = `<tr><td colspan="5">❌ No se encontraron productos</td></tr>`;
            return;
        }

        for (const prod of productosPagina) {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${prod.id}</td>
                <td>${prod.nombre}</td>
                <td>${prod.precio}</td>
                <td>${prod.ventas}</td>
                <td>${prod.categoria}</td>
            `;
            fragment.appendChild(fila);
        }

        productosTbody.appendChild(fragment);
        crearPaginacion(productosFiltrados.length);
    };

    const crearPaginacion = (total) => {
        const totalPaginas = Math.ceil(total / productosPorPagina);
        paginacion.innerHTML = "";
        if (totalPaginas <= 1) return;

        const btnAnterior = crearBoton("⬅️ Anterior", paginaActual === 1, () => {
            paginaActual--;
            mostrarProductos();
        });

        const spanPagina = document.createElement("span");
        spanPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
        spanPagina.setAttribute("aria-live", "polite");

        const btnSiguiente = crearBoton("Siguiente ➡️", paginaActual === totalPaginas, () => {
            paginaActual++;
            mostrarProductos();
        });

        paginacion.append(btnAnterior, spanPagina, btnSiguiente);
    };

    const crearBoton = (texto, disabled, onClick) => {
        const btn = document.createElement("button");
        btn.textContent = texto;
        btn.disabled = disabled;
        btn.addEventListener("click", onClick);
        return btn;
    };

    let debounceTimer;
    const aplicarFiltros = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const busqueda = inputBusqueda.value.toLowerCase();
            const dimension = selectDimension.value;

            productosFiltrados = productos.filter(p => {
                const nombreCoincide = p.nombre.toLowerCase().includes(busqueda);
                const categoriaCoincide = dimension === "" || p.categoria === dimension;
                return nombreCoincide && categoriaCoincide;
            });

            paginaActual = 1;
            mostrarProductos();
        }, 200);
    };

    fetch("PruebaGPT.json")
        .then(res => res.json())
        .then(data => {
            productos = data;
            productosFiltrados = [...productos];
            mostrarProductos();

            setTimeout(() => {
                loader.style.opacity = "0";
                loader.style.transition = "opacity 0.5s ease-out";
                setTimeout(() => {
                    loader.style.display = "none";
                    container.style.display = "block";
                    container.classList.add("animado-portal");
                    focusMain();
                }, 500);
            }, 1000);
        })
        .catch(err => {
            productosTbody.innerHTML = `<tr><td colspan="5">❌ Error cargando productos</td></tr>`;
            console.error("Error al cargar productos:", err);
        });

    inputBusqueda.addEventListener("input", aplicarFiltros);
    selectDimension.addEventListener("change", aplicarFiltros);
});
