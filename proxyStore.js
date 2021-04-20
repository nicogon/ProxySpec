class ProxyStore {
    constructor() {
        this.proxyMap = [];
        this.nextId = 1;
    }

    create(proxy) {
        this.proxyMap[this.nextId]  = proxy;
        this.nextId = this.nextId + 1;
        return this.nextId - 1;
    }

    set(proxyId, proxy) {
        this.proxyMap[proxyId] = proxy;
    }

    get(proxyId) {
        //console.log(proxyId,this.proxyMap[1])
        return this.proxyMap[proxyId];
    }
}


const defaultStore = new ProxyStore();
module.exports = defaultStore;
