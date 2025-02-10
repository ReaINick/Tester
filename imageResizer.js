const imageResizer = {
    images: {},
    imageUrls: {
        virus: 'https://github.com/ReaINick/Tester/blob/main/virus.png',
        recombine: 'https://github.com/ReaINick/Tester/blob/main/recombine.png'
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
