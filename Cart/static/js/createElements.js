const createDivItem = (cl, inner = "") => {
  const divItem = document.createElement("div");
  divItem.classList.add(cl);
  divItem.innerHTML = inner;
  return divItem;
};

const createImageItem = (src, cl) => {
  const imgItem = document.createElement("img");
  imgItem.setAttribute("src", src);
  imgItem.classList.add(cl);
  return imgItem;
};

const createPItem = (content, cl) => {
  const pItem = document.createElement("p");
  pItem.innerHTML = content;
  pItem.classList.add(cl);
  return pItem;
};

const createSpanItem = (content, cl) => {
  const spanItem = document.createElement("span");
  spanItem.innerHTML = content;
  spanItem.classList.add(cl);
  return spanItem;
};

const createHrItem = (cl) => {
  const hrItem = document.createElement("hr");
  hrItem.classList.add(cl);
  return hrItem;
};

const createHItem = (content, cl, size) => {
  const hItem = document.createElement("h" + size);
  hItem.innerHTML = content;
  hItem.classList.add(cl);
  return hItem;
};

const createH2Item = (content, cl) => {
  const h2Item = document.createElement("h2");
  h2Item.innerHTML = content;
  h2Item.classList.add(cl);
  return h2Item;
};
