class ProxyStore {
    constructor() {
        this.proxyMap = new Map();
        this.nextId = 1;
    }

    create(proxy) {
        proxy.id = `${this.nextId}`;
        this.proxyMap.set(proxy.id, proxy);
        this.nextId = this.nextId + 1;
        return proxy;
    }

    get(proxyId) {
        const proxy = this.proxyMap.get(proxyId);
        console.log(`got proxy for id ${proxyId}`, proxy);
        return proxy;
    }
}


const defaultStore = new ProxyStore();
module.exports = defaultStore;
