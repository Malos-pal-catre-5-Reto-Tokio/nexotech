const REGIONES_COMUNAS = {
  "Región de Arica y Parinacota": ["Arica", "Putre", "Camarones"],
  "Región de Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte"],
  "Región de Antofagasta": ["Antofagasta", "Calama", "Tocopilla"],
  "Región de Atacama": ["Copiapó", "Vallenar", "Caldera"],
  "Región de Coquimbo": ["La Serena", "Coquimbo", "Ovalle"],
  "Región de Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué"],
  "Región Metropolitana de Santiago": ["Santiago", "Providencia", "Las Condes", "Maipú", "Puente Alto"],
  "Región del Libertador Bernardo O'Higgins": ["Rancagua", "San Fernando", "Rengo"],
  "Región del Maule": ["Talca", "Curicó", "Linares"],
  "Región de Ñuble": ["Chillán", "Chillán Viejo", "San Carlos"],
  "Región del Biobío": ["Concepción", "Talcahuano", "Los Ángeles"],
  "Región de la Araucanía": ["Temuco", "Padre Las Casas", "Villarrica"],
  "Región de Los Ríos": ["Valdivia", "La Unión", "Panguipulli"],
  "Región de Los Lagos": ["Puerto Montt", "Osorno", "Castro"],
  "Región de Aysén": ["Coyhaique", "Puerto Aysén", "Chile Chico"],
  "Región de Magallanes y la Antártica Chilena": ["Punta Arenas", "Puerto Natales", "Porvenir"],
};

function poblarRegiones(selectRegionId, selectComunaId) {
  const selectRegion = document.getElementById(selectRegionId);
  const selectComuna = document.getElementById(selectComunaId);

  if (!selectRegion || !selectComuna) return;

  Object.keys(REGIONES_COMUNAS).forEach((region) => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    selectRegion.appendChild(option);
  });

  selectRegion.addEventListener('change', () => {
    const comunas = REGIONES_COMUNAS[selectRegion.value] || [];

    selectComuna.innerHTML = '<option value="">-- Seleccione la comuna --</option>';

    comunas.forEach((comuna) => {
      const option = document.createElement('option');
      option.value = comuna;
      option.textContent = comuna;
      selectComuna.appendChild(option);
    });
  });
}

poblarRegiones('region', 'comuna');