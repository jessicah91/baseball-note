document.getElementById("soften").onclick = () => {
  const text = document.getElementById("input").value;

  const softened = text
    .replace(/씨발|ㅅㅂ/g, "아쉽다")
    .replace(/존나/g, "정말")
    .replace(/개같/g, "힘들었");

  document.getElementById("result").innerText = softened;
};

document.getElementById("modeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};
