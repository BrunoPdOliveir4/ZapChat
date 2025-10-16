import { Module } from "@nestjs/common";
import { CryptoService } from "./crypt.service";


@Module({
    providers: [CryptoService],
    exports: [CryptoService]
})

export class CryptModule {}