## Local Development Setup

1. **Clone the repository:**
   ```
   git clone <your-repo-url>
   cd GoQuant/assessment/frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the development server:**
   ```
   npm run dev
   ```

4. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)


## Assumptions

- Only BTC-USD, ETH-USD, and SOL-USD symbols are supported.
- WebSocket APIs are publicly accessible and do not require authentication.

## API Documentation

- [OKX WebSocket API](https://www.okx.com/docs-v5/en/#websocket-api)
- [Bybit WebSocket API](https://bybit-exchange.github.io/docs/v5/websocket/public/)
- [Deribit WebSocket API](https://docs.deribit.com/#public-get_order_book)

## Rate Limiting Considerations

- The app maintains a single WebSocket connection per venue.
- No polling is used; all updates are via WebSocket streams.
- If you encounter rate limits, try reducing the frequency of venue switching or reconnecting after a short delay.
