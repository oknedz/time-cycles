const predef = require("./tools/predef");
const meta = require("./tools/meta");
const { px, du, op } = require("./tools/graphics");

class TimeCyclesV4Boxes {
    init() {
        // Cycle tracking for each type
        this.current90 = { idx: -1, high: null, low: null, startBar: null };
        this.current30 = { idx: -1, high: null, low: null, startBar: null };
        this.current10 = { idx: -1, high: null, low: null, startBar: null };
        this.currentAsia = { idx: -1, high: null, low: null, startBar: null };
        
        this.prevDayOfWeek = null;
    }

    map(d, i, history) {
        // Get timeframe in minutes
        const tfMin = d.period() / 60;
        const validTf = tfMin <= 240;

        if (!validTf) {
            return {};
        }

        // Auto-adjust logic
        const act90 = this.props.autoAdj ? (tfMin <= 240 && this.props.show90) : this.props.show90;
        const act30 = this.props.autoAdj ? (tfMin <= 60 && this.props.show30) : this.props.show30;
        const act10 = this.props.autoAdj ? (tfMin <= 30 && this.props.show10) : this.props.show10;

        // Symbol detection
        const symbol = d.symbol() || '';
        const isJpyPair = symbol.includes('EURJPY') || symbol.includes('USDJPY') || 
                          symbol.includes('6E') || symbol.includes('6J');

        // Get NY time
        const date = new Date(d.timestamp());
        const nyTime = this.toNYTime(date);
        const nyMinTotal = nyTime.hours * 60 + nyTime.minutes;

        // Track cycles
        const inAsia = (nyMinTotal >= 1080 || nyMinTotal < 150);
        const inMain = (nyMinTotal >= 150 && nyMinTotal < 960);

        const graphicsItems = [];

        // Asia session cycles for JPY pairs
        if (inAsia && isJpyPair && act90) {
            const adjustedMin = nyMinTotal >= 1080 ? (nyMinTotal - 1080) : (nyMinTotal + 1440 - 1080);
            const idxAsia = Math.floor(adjustedMin / 90);
            
            if (idxAsia !== this.currentAsia.idx) {
                this.currentAsia = { idx: idxAsia, high: d.high(), low: d.low(), startBar: i };
            } else {
                this.currentAsia.high = Math.max(this.currentAsia.high, d.high());
                this.currentAsia.low = Math.min(this.currentAsia.low, d.low());
            }
            
            // Always draw the current Asia box
            if (this.currentAsia.startBar !== null) {
                const box = this.createBoxGraphic(
                    this.currentAsia.startBar, 
                    i, 
                    this.currentAsia.high, 
                    this.currentAsia.low, 
                    this.props.colorAsia,
                    'asia'
                );
                if (box) graphicsItems.push(box);
            }
        }

        // Main session 90min cycles
        if (inMain && act90) {
            const idx90 = Math.floor((nyMinTotal - 150) / 90);
            const colors = [this.props.color90A, this.props.color90M, this.props.color90D];
            const color = colors[idx90 % 3];
            
            if (idx90 !== this.current90.idx) {
                this.current90 = { idx: idx90, high: d.high(), low: d.low(), startBar: i };
            } else {
                this.current90.high = Math.max(this.current90.high, d.high());
                this.current90.low = Math.min(this.current90.low, d.low());
            }
            
            // Always draw the current 90min box
            if (this.current90.startBar !== null) {
                const box = this.createBoxGraphic(
                    this.current90.startBar, 
                    i, 
                    this.current90.high, 
                    this.current90.low, 
                    color,
                    'cycle90'
                );
                if (box) graphicsItems.push(box);
            }
        }

        // 30min cycles
        if (inMain && act30) {
            const idx30 = Math.floor((nyMinTotal - 150) / 30);
            
            if (idx30 !== this.current30.idx) {
                this.current30 = { idx: idx30, high: d.high(), low: d.low(), startBar: i };
            } else {
                this.current30.high = Math.max(this.current30.high, d.high());
                this.current30.low = Math.min(this.current30.low, d.low());
            }
            
            // Always draw the current 30min box
            if (this.current30.startBar !== null) {
                const box = this.createBoxGraphic(
                    this.current30.startBar, 
                    i, 
                    this.current30.high, 
                    this.current30.low, 
                    this.props.color30,
                    'cycle30'
                );
                if (box) graphicsItems.push(box);
            }
        }

        // 10min cycles
        if (inMain && act10) {
            const idx10 = Math.floor((nyMinTotal - 150) / 10);
            
            if (idx10 !== this.current10.idx) {
                this.current10 = { idx: idx10, high: d.high(), low: d.low(), startBar: i };
            } else {
                this.current10.high = Math.max(this.current10.high, d.high());
                this.current10.low = Math.min(this.current10.low, d.low());
            }
            
            // Always draw the current 10min box
            if (this.current10.startBar !== null) {
                const box = this.createBoxGraphic(
                    this.current10.startBar, 
                    i, 
                    this.current10.high, 
                    this.current10.low, 
                    this.props.color10,
                    'cycle10'
                );
                if (box) graphicsItems.push(box);
            }
        }

        // Return graphics
        if (graphicsItems.length > 0) {
            // Debug: log when we're drawing boxes
            if (i % 100 === 0) {
                console.log('Bar', i, '- Drawing', graphicsItems.length, 'boxes', 'NY time:', nyMinTotal);
            }
            return {
                graphics: {
                    items: graphicsItems
                }
            };
        }

        return {};
    }

    createBoxGraphic(startBar, endBar, high, low, color, key) {
        // Validate inputs
        if (startBar === null || endBar === null || high === null || low === null) {
            return null;
        }
        
        const width = endBar - startBar + 1;
        const height = high - low;
        
        // Make sure we have valid dimensions
        if (width <= 0 || height <= 0) {
            return null;
        }
        
        const centerX = startBar + width / 2;
        const centerY = low + height / 2;

        return {
            tag: 'Shapes',
            key: key,
            primitives: [
                {
                    tag: 'Rectangle',
                    position: {
                        x: du(centerX),
                        y: du(centerY)
                    },
                    size: {
                        width: du(width),
                        height: du(height)
                    }
                }
            ],
            fillStyle: {
                color: color
            }
        };
    }

    toNYTime(date) {
        // Better NY time conversion using locale
        try {
            const nyString = date.toLocaleString('en-US', { 
                timeZone: 'America/New_York',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            const [hours, minutes] = nyString.split(':').map(Number);
            
            return {
                hours: hours,
                minutes: minutes,
                dayOfWeek: new Date(date.toLocaleString('en-US', { timeZone: 'America/New_York' })).getDay()
            };
        } catch (e) {
            // Fallback to simple offset
            const utcHours = date.getUTCHours();
            const utcMinutes = date.getUTCMinutes();
            
            let nyHours = utcHours - 5;
            if (nyHours < 0) nyHours += 24;
            
            return {
                hours: nyHours,
                minutes: utcMinutes,
                dayOfWeek: date.getUTCDay()
            };
        }
    }
}

module.exports = {
    name: "timeCyclesV4Boxes",
    description: "Time Cycles V4 - With Boxes",
    calculator: TimeCyclesV4Boxes,
    params: {
        show90: predef.paramSpecs.bool(true),
        show30: predef.paramSpecs.bool(true),
        show10: predef.paramSpecs.bool(false),
        autoAdj: predef.paramSpecs.bool(true),
        
        // Colors
        color90A: predef.paramSpecs.color('#FF000033'),
        color90M: predef.paramSpecs.color('#0000FF33'),
        color90D: predef.paramSpecs.color('#00FF0033'),
        color30: predef.paramSpecs.color('#80808033'),
        color10: predef.paramSpecs.color('#80808033'),
        colorAsia: predef.paramSpecs.color('#80008033')
    },
    tags: ['Time Cycles', 'Sessions', 'ICT'],
    inputType: meta.InputType.BARS,
    areaChoice: meta.AreaChoice.OVERLAY
};
