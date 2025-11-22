const MapRenderer = {
    canvas: null,
    ctx: null,
    nodes: [],
    width: 0,
    height: 0,
    animationId: null,

    init: function(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Click Handler
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            console.log('Canvas clicked at:', x, y);

            this.nodes.forEach(node => {
                // Simple Distance check (30px radius)
                const dist = Math.sqrt((x - node.x)**2 + (y - node.y)**2);
                if (dist < 30) {
                    console.log('Node clicked:', node.id);
                    // Dispatch event for Main.js to hear
                    window.dispatchEvent(new CustomEvent('node-clicked', { detail: { nodeId: node.id } }));
                }
            });
        });
    },

    resize: function() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if (this.nodes.length) this.draw();
    },

    generateNodes: function(type) {
        this.nodes = [];
        const count = 9; // Fixed for now
        const padding = 100;

        for(let i=0; i<count; i++) {
            const progress = i / (count - 1);
            let x, y;

            if (type === 'circular') {
                const angle = progress * Math.PI * 2 - (Math.PI / 2);
                x = (this.width/2) + Math.cos(angle) * (this.width/3);
                y = (this.height/2) + Math.sin(angle) * (this.height/3);
            } else {
                // Winding
                x = padding + (progress * (this.width - padding*2));
                y = (this.height/2) + Math.sin(progress * Math.PI * 3) * 150;
            }

            this.nodes.push({ id: i, x, y, status: i === 0 ? 'current' : 'locked' });
        }
        this.startAnimation();
    },

    draw: function() {
        this.ctx.clearRect(0,0,this.width, this.height);

        // Draw Lines
        if (this.nodes.length > 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.nodes[0].x, this.nodes[0].y);
            for (let i=0; i<this.nodes.length-1; i++) {
                const p0 = this.nodes[i];
                const p1 = this.nodes[i+1];
                this.ctx.lineTo(p1.x, p1.y);
            }
            this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
            this.ctx.lineWidth = 5;
            this.ctx.setLineDash([15, 15]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw Nodes
        this.nodes.forEach(node => {
            // Draw pulsing glow for current node
            if (node.status === 'current') {
                const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, 40, 0, Math.PI*2);
                this.ctx.fillStyle = `rgba(241, 196, 15, ${pulse * 0.5})`;
                this.ctx.fill();
            }

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 25, 0, Math.PI*2);

            if (node.status === 'completed') this.ctx.fillStyle = '#27ae60';
            else if (node.status === 'current') this.ctx.fillStyle = '#f1c40f';
            else this.ctx.fillStyle = '#7f8c8d';

            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Draw Number
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.id + 1, node.x, node.y);

            // Draw "TAP!" hint for current node
            if (node.status === 'current') {
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.fillText('TAP!', node.x, node.y + 45);
            }
        });
    },

    startAnimation: function() {
        const animate = () => {
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },

    updateNodeStatus: function(nodeId, status) {
        if (this.nodes[nodeId]) {
            this.nodes[nodeId].status = status;
            this.draw();
        }
    },

    getNodePos: function(nodeId) {
        return this.nodes[nodeId] ? { x: this.nodes[nodeId].x, y: this.nodes[nodeId].y } : {x:0,y:0};
    }
};
