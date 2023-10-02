const sharp = require('sharp');
const uuid = require('uuid');
const path = require('path');

class ResizeImage {
    constructor (folder) {
        this.folder = folder;
    }

    async save(buff) {
        const fileName = ResizeImage.fileName();
        const filePath = this.filePath(fileName);
        await sharp(buff).resize(500, 500, {
            fit: sharp.fit.inside,
            withoutEnlargement: true
        }).toFile(filePath);
        return fileName;
    }

    static fileName() {
       return `${uuid.v4()}.png`;
    }

    filePath(fileName) {
        return path.resolve(`${this.folder}/${fileName}`);
    }
}

module.exports = ResizeImage;