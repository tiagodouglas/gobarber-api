import { Model, Sequelize } from 'sequelize';

class File extends Model {
    static init(sequelize) {
        super.init({
            name: Sequelize.STRING,
            path: Sequelize.STRING,
            url: {
                type: Sequelize.VIRTUAL,
                get() {
                    return `htpp://localhost:5555/files/${this.path}`
                }
            }
        }, {
            sequelize
        });

        return this;
    }
}

export default File;