class VMB_Message {
    timestamp=0
    priority=0
    address=0
    len=0
    part=0
    fct=0
    param=0

    constructor(data) {
        this.timestamp = date()
        this.priority = data[1]
        this.address = data[2]
        this.len = data[3]
        this.fct = data[4]
        this.param = data.slice(5, this.len+1)
    }
}