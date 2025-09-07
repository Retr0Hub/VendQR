async function getData(endpoint = '/data.json') {
  try {
    let res = await fetch(endpoint);
    let data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
  }
}
