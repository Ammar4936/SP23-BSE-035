const images = [
    "Pics/kid.webp",
    "Pics/men1.webp",
    "Pics/women1.webp"
]

const carousel = document.getElementById("carousel-container");
let index = 0;

// Use backticks for the template literal
carousel.style.backgroundImage = `url(${images[index]})`;

document.getElementById("larrow").addEventListener("click", function(){
    index = (index + 1) % images.length;
    carousel.style.backgroundImage = `url(${images[index]})`;  
})

document.getElementById("rarrow").addEventListener("click", function(){
    index = (index - 1 + images.length) % images.length;
    carousel.style.backgroundImage = `url(${images[index]})`;  
})
