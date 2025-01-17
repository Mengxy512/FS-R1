There are 2 parts: front-end and back-end. You need to open individual window for each end. Start backend project first, then start frontend project to preview.

The live page at http://112.124.59.151/


## Back-end

You need to start nest-gbm-stock generator to provide SSE first, or the code will report error.

I will provide mysql and kafka service in my online server. You can change it through .env file under config folder.

### Introduction

<pre>
backend
├── README.md
├── src
├── dist
├── config
└── package.json
</pre>

Source code will be stored in src folder, and generated code will be in dist folder. Config  folder will stroe environment variables.
Index.ts is the router file, which imports notification.ts(get/post notification preference) and stockPrice.ts(get stock price). Kafka.ts and db.ts are utils modules. listener.ts will keep watching stock price and store the data in the mysql. samplingPrices.ts will calculate open price and close price per second and minute. checker.ts will check if any notifcation is triggered and send it through kafka. consumer.ts will consume kafka message and send alert to front-end.

### Installation

```shell
cd ./backend
npm install
npx tsc

```

### Run
```shell
npm run start:all
```

## Front-end

The needed backend api service is provided on online server.

### Introduction

There are parts on the page. Top part is nofication preference setter. You can change the preference setting by submit button. Since it's a demo, so we only have 1 default user. Buttom part is the K-chart plot. You can switch the time range and time interval to show the plot. It will pop alert window if any notification is triggered.

### Installation

```shell
cd ./frontend
npm install

```

### Run
```shell
npm run serve
```

The page will on http://localhost:8080/

