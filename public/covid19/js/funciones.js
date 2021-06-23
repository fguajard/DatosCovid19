import {
  //
  html,
  h,
} from "https://unpkg.com/gridjs?module";

const baseUrl = `http://localhost:3000/api/`;

const extraerDatosDePaises = async () => {
  try {
    const requestDatosPaises = await axios(`${baseUrl}total`);
    const datosPaises = requestDatosPaises.data.data;
    return datosPaises;
  } catch (err) {
    console.log(new Error(err));
  }
};

const extraerDatosPais = async (nombrePais) => {
  try {
    const codigoPais = await tranformarNombreACodigo(nombrePais);
    const requestDatosPais = await axios(`${baseUrl}countries/${codigoPais}`);
    const datosPais = requestDatosPais.data.data;
    return datosPais;
  } catch (err) {
    console.log(new Error(err));
  }
};

const filtarMasDeXCasosActivos = (cantidadActivos, datosPaises) => {
  // const datosPaises = await extraerDatosDePaises()
  const datosFiltrados = datosPaises.filter((paises) => {
    return paises.active > cantidadActivos;
  });
  return datosFiltrados;
};

const renderGrafico = (datosPaises) => {
  // const datosPaises = await filtarMasDeXCasosActivos(1000000)
  const labels = datosPaises.map((pais) => pais.location);
  const casosActivos = datosPaises.map((pais) => pais.active);
  const casosConfirmados = datosPaises.map((pais) => pais.confirmed);
  const muertes = datosPaises.map((pais) => pais.deaths);
  const casosRecuperados = datosPaises.map((pais) => pais.recovered);
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Activos",
        data: casosActivos,
        backgroundColor: ["rgba(153, 102, 255, 0.2)"],
        borderColor: ["rgba(153, 102, 255, 1)"],
        borderWidth: 1,
      },
      {
        label: "Confirmados",
        data: casosConfirmados,
        backgroundColor: ["rgba(255, 159, 64, 0.2)"],
        borderColor: ["rgba(255, 159, 64, 1)"],
        borderWidth: 1,
      },
      {
        label: "Muertos",
        data: muertes,
        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
      {
        label: "Recuperados",
        data: casosRecuperados,
        backgroundColor: ["rgba(75, 192, 192, 0.2)"],
        borderColor: ["rgba(75, 192, 192, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "bar",
    data,
    options: {},
  };

  const myChart = new Chart(document.getElementById("myChart"), config);
};

//crear tabla
const renderTable = async (datosPaises) => {
  // const datosPaises = await extraerDatosDePaises()
  const columns = Object.keys(datosPaises[0]); //pueden ser las keys de cualquier elemento
  const data = datosPaises.map((pais) => [
    pais.location,
    pais.confirmed,
    pais.deaths,
    pais.recovered,
    pais.active,
  ]);

  //buttons in table
  columns.push({
    name: "Actions",
    formatter: (cell, row) => {
      return h(
        "button",
        {
          className: "py-2 mb-4 px-4 border rounded-md text-white bg-info",
          onClick: () => showModalDatosAPI(row.cells[0].data), //row.cells[0].data = nombre del  pais
          //showModalDatosLocales(row.cells[1].data,row.cells[2].data,row.cells[3].data,row.cells[4].data)
        },
        "Ver Detalle"
      );
    },
  });
  new gridjs.Grid({
    columns: columns,
    sort: true,
    search: true,
    data: data,
  }).render(document.getElementById("wrapper")); //elemento html con id wrapper
};

const tranformarNombreACodigo = async (paisBuscado) => {
  const listaPaises = await axios("./js/paises.json");
  const [codigoPaisEncontrado] = listaPaises.data.filter(
    (pais) => pais.Name == paisBuscado
  );
  return codigoPaisEncontrado.Code;
};

//retorna el objeto de config del grafico en modal
const renderGraficoModal = (
  casosActivos,
  casosConfirmados,
  muertes,
  casosRecuperados
) => {
  const data = {
    labels: ["activos", "confirmados", "muertes", "recuperados"],
    datasets: [
      {
        label: "# of Votes",
        data: [casosActivos, casosConfirmados, muertes, casosRecuperados],
        backgroundColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderColor: [
          "rgba(255, 206, 86, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const config = {
    type: "pie",
    data,
    options: {},
  };

  return config;
};

const renderCalendario = () => {
  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
  });
  calendar.render();
};

const obtenerToken = async (credencialesDeUsuario) => {
  try {
    const request = await axios.post(`${baseUrl}login`, credencialesDeUsuario);
    const { token } = request.data;
    return token;
  } catch (err) {
    console.log(new Error(err));
  }
};

const axiosDatosChileConToken = async (token) => {
  try {
    const confirmados = axios(`${baseUrl}confirmed`, {
      headers: {
        Authorization: token,
      },
    });
    const muertes = axios(`${baseUrl}deaths`, {
      headers: {
        Authorization: token,
      },
    });
    const recuperados = axios(`${baseUrl}recovered`, {
      headers: {
        Authorization: token,
      },
    });

    const arrayDataChile = await Promise.all([
      confirmados,
      muertes,
      recuperados,
    ]);
    const datosChile = arrayDataChile.map((axiosRequest) =>
      axiosRequest.data.data.reduce((objetoAlmacen, dato) => {
        objetoAlmacen[dato.date] = dato.total;
        return objetoAlmacen;
      }, {})
    );
    localStorage.setItem("datosChile", JSON.stringify(datosChile));
    return datosChile;
  } catch (err) {
    console.log(new Error(err));
  }
};

const renderDatosChile = (objetoConDatosChile) => {
  const [confirmados, muertos, recuperados] = objetoConDatosChile;
  const labels = Object.keys(confirmados);
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Confirmados",
        data: Object.values(confirmados),
        backgroundColor: ["rgba(255, 159, 64, 0.2)"],
        borderColor: ["rgba(255, 159, 64, 1)"],
        borderWidth: 0.5,
        fill: false,
        tension: 0.1,
      },
      {
        label: "Muertos",
        data: Object.values(muertos),
        backgroundColor: ["rgba(255, 99, 132, 0.2)"],
        borderColor: ["rgba(255, 99, 132, 1)"],
        borderWidth: 0.5,
        fill: false,
        tension: 0.1,
      },
      {
        label: "Recuperados",
        data: Object.values(recuperados),
        backgroundColor: ["rgba(75, 192, 192, 0.2)"],
        borderColor: ["rgba(75, 192, 192, 1)"],
        borderWidth: 0.5,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const config = {
    type: "line",
    data,
    options: {},
  };

  const myChart = new Chart(document.getElementById("myChart2"), config);
};

export default {
  extraerDatosDePaises,
  extraerDatosPais,
  filtarMasDeXCasosActivos,
  renderGrafico,
  renderTable,
  renderGraficoModal,
  renderCalendario,
  obtenerToken,
  axiosDatosChileConToken,
  renderDatosChile,
};
