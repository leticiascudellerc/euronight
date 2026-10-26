const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "it", name: "Italiano" },
  { code: "el", name: "Ελληνικά" },
  { code: "tr", name: "Türkçe" },
  { code: "fr", name: "Français" },
  { code: "hr", name: "Hrvatski" },
  { code: "ro", name: "Română" },
  { code: "bg", name: "Български" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "pt", name: "Português" },
  { code: "pl", name: "Polski" }
];

async function loadLanguage(code) {

  const url = `./languages/${code}.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data); 
    applyTranslations(data);
  } catch (error) {
    console.error('Failed to Failed to load language:', error);
  }

}
  function applyTranslations(data){
   const elements = document.querySelectorAll('[data-i18n]');
   // keep the strings where script.js can read them, for text it sets itself (Menu, Close, Dancing...)
    window.currentStrings = data;

for (const element of elements) {
    
   const key = element.dataset.i18n
  if (data[key]) {
      element.textContent = data[key];
    }
}

};

const langBtn = document.getElementById("langBtn");
const langList = document.getElementById("langList");
const langCode = document.getElementById("langCode");

LANGUAGES.forEach(function (language) {
  const li = document.createElement("li");
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = language.name;

  b.addEventListener("click", function () {
    loadLanguage(language.code);
    langCode.textContent = language.code.toUpperCase();
    langList.hidden = true;
  });

  li.appendChild(b);
  langList.appendChild(li);
});
langBtn.addEventListener('click', () => langList.hidden = !langList.hidden);
