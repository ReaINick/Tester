const imageResizer = {
    images: {},
    imageUrls: {
        virus: 'https://raw.githubusercontent.com/ReaINick/Tester/main/virus.png',
        recombine: 'https://raw.githubusercontent.com/ReaINick/Tester/main/recombine.png'
    },

    loadImage: function (name, url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                resolve();
            };
            img.onerror = () => {
                reject(`Failed to load image: ${name}`);
            };
            img.src = url;
        });
    },

    loadImages: function (names) {
        const promises = names.map(name => this.loadImage(name, this.imageUrls[name]));
        return Promise.all(promises);
    }
};
