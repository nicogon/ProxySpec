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

    set(proxyId, proxy) {
        this.proxyMap[proxyId] = proxy;
    }

    get(proxyId) {
        console.log(proxyId, this.proxyMap[1])
        return this.proxyMap.get(proxyId);
    }
}


const defaultStore = new ProxyStore();
module.exports = defaultStore;
