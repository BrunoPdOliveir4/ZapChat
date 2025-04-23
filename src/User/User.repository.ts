import { Model, model } from 'mongoose';
import { UserSchema } from './User.schema';

const UserModel: Model<any> = model('User', UserSchema);

class UserRepository {
    async createUser(userData: { name: string; email: string; password: string }) {
        const user = new UserModel(userData);
        return await user.save();
    }

    async findAll(){
        return UserModel.find();
    }

    async findUserByUsername(username: string) {
        return await UserModel.findOne({ username });
    }

    async findUserById(id: string) {
        return await UserModel.findById(id);
    }

    async updateUser(id: string, updateData: Partial<{ name: string; password: string }>) {
        return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteUser(id: string) {
        return await UserModel.findByIdAndDelete(id);
    }
}

export default new UserRepository();