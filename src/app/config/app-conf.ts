export const APP_CONF = {
  highlightStyles: [
    {
      wid: 4.5,
      color: '#FCE903',
      name: 'yellow'
    },
    {
      wid: 4.5,
      color: '#00ffff',
      name: 'turquaz'
    },
    {
      wid: 4.5,
      color: '#04f06a',
      name: 'green'
    }
  ],
  currHighlightIdx: 0,
  isIgnoreCaseInText: false,
  sampleDataNodeCount: 3,
  sampleDataEdgeCount: 2,
  currLayout: 'fcose',
  graphHistoryLimit: 25,
  server: 'https://tiger-api.herokuapp.com',
  nodeTypes: [],
  tigerGraphDbConfig: {
    url: 'https://covid19.i.tgcloud.io:9000',
    token: 'o5lu7b7i3gmoi10fuucopsruidrf978o',
    tokenExpire: 1612176462,
    secret: '48vmuf6sijcsrol1avv3vstavlknk1o7',
    username: 'tigergraph',
    password: '123456',
    graphName: 'MyGraph'
  },
  neo4jDbConfig: {
    url: 'http://localhost:7474/db/data/transaction/commit',
    username: 'neo4j',
    password: '123',
  },
  databaseType: 0
}