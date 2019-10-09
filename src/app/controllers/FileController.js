import File from '../models/File';

class FileController {
    async store(req, res) {
        const {originalName: name, fileName: path} = req.file;

        const file = await File.create({
            name,
            path
        });

        return res.ok(file);
    }
}

export default new FileController();