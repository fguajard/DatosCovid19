import funciones from "./funciones.js";

const {
  extraerDatosDePaises,
  extraerDatosPais,
  filtarMasDeXCasosActivos,
  renderGrafico,
  renderTable,
  renderGraficoModal,
  renderCalendario,
  obtenerToken,
  axiosDatosChileConToken,
  renderDatosChile
} = funciones;

const baseUrl = `http://localhost:3000/api/`;

// window.showModalDatosLocales = (
//   casosActivos,
//   casosConfirmados,
//   muertes,
//   casosRecuperados
// ) => {
//   const configGrafico = renderGraficoModal(
//     +casosActivos,
//     +casosConfirmados,
//     +muertes,
//     +casosRecuperados
//   );
//   const myChart = new Chart(document.getElementById("chartModal"), configGrafico);
//   $("#exampleModalCenter").modal("toggle");
//   $("#exampleModalCenter").on("hidden.bs.modal", function (e) {
//     myChart.destroy();
//   });
// };

window.showModalDatosAPI = async (nombrePais) => {
  const datosPais = await extraerDatosPais(nombrePais);
  const { confirmed, deaths, recovered, active } = datosPais;
  $("#modalTitle").html(`${nombrePais}`);
  const configGrafico = renderGraficoModal(active, confirmed, deaths, recovered); //devuelve el objeto de configuracion
  const myChart = new Chart(document.getElementById("chartModal"), configGrafico);
  $("#exampleModalCenter").modal("toggle");
  $("#exampleModalCenter").on("hidden.bs.modal", function (e) {
    myChart.destroy();
  });
};

let tokenLocal = JSON.parse(localStorage.getItem("token"));

$("#formularioLogin").on("submit", async (event) => {
  event.preventDefault();
  const email = $("#usuarioLogin").val();
  const password = $("#contraseñaLogin").val();
  const credencialesDeUsuario = { email, password };
  const token = await obtenerToken(credencialesDeUsuario);
  if(token){
    localStorage.setItem("token", JSON.stringify(token));
    $("#modalLogin").modal("toggle");
    $("#cerrarSesion").toggleClass("d-none");
    $("#datosChile").toggleClass("d-none");
    $("#loginButton").toggleClass("d-none");
    const datosAxios = await axiosDatosChileConToken(token);
    renderDatosChile(datosAxios);
  }
 else{
   alert("Credenciales Incorrectas")
 }
});

$("#datosChile").on("click", () => {  
  $("#myChart").hide();//grafico mundial
  $("#myChart2").show();//grafico de chile
  $("#divTable").hide();
  
});

$("#cerrarSesion").on("click", () => {  
  $("#cerrarSesion").toggleClass("d-none");
  $("#datosChile").toggleClass("d-none");
  $("#loginButton").toggleClass("d-none");
  $("#myChart").show();
  $("#myChart2").hide();
  $("#divTable").show();  
  localStorage.clear()
});

$("#home").on("click", () => {  
  $("#myChart").show();
  $("#myChart2").hide();
  $("#divTable").show();
});


(async () => {
  if (!!tokenLocal) {
    $("#cerrarSesion").toggleClass("d-none");
    $("#datosChile").toggleClass("d-none");
    $("#loginButton").toggleClass("d-none");
    // const datosAxios = await axiosDatosChileConToken(tokenLocal);
    const datosChileLocales = localStorage.getItem("datosChile")
    renderDatosChile(JSON.parse(datosChileLocales));    
  }
  const datosPaises = await extraerDatosDePaises();
  const datosPaisesFiltrados = filtarMasDeXCasosActivos(1000000, datosPaises);
  renderGrafico(datosPaisesFiltrados);
  renderTable(datosPaises);
  //renderCalendario();
})();
