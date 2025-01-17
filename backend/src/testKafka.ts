import { sendMessage } from './kafka';

const checkPrices = async () => {
    try {
        const message = `1`;
        await sendMessage('price-check', message);
    } catch (error) {
      console.error(`Test Error: `, error);
    }
}
checkPrices();