class ProxyStore {
    constructor() {
        this.proxyMap = new Map();
        this.nextId = 1;
    }

    create(proxy) {
        proxy.id = this.nextId;
        this.proxyMap.set(proxy.id, proxy);
        this.nextId = this.nextId + 1;
        return proxy;
    }

    set(proxyId, proxy) {
        this.proxyMap.set(proxyId, proxy);
    }

    get(proxyId) {
        return this.proxyMap.get(proxyId);
    }
}


const defaultStore = new ProxyStore();
module.exports = defaultStore;
