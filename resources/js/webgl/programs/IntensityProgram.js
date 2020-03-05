import Program from './Program';

export default class IntensityProgram extends Program {
    constructor(vertexShaderSource, fragmentShaderSource, dataset) {
        super(vertexShaderSource, fragmentShaderSource);

        this.dataset = dataset;
        this.framebuffer = null;
        this.outputTexture = null;
        this.intensities = new Uint8Array(this.dataset.width * this.dataset.height * 4);
        this.intensityStats = {
            min: 0,
            max: 0,
        };
    }

    initialize(gl, handler) {
        let pointer = this.getPointer();
        handler.useVertexPositions(this);
        handler.useTexturePositions(this);
        handler.useTextures(this);

        this.framebuffer = handler.getFramebuffer('intensity');

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.outputTexture = handler.getTexture('intensity');
        gl.bindTexture(gl.TEXTURE_2D, this.outputTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.dataset.width, this.dataset.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.outputTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    beforeRender(gl, handler) {
        handler.bindTextures();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    afterRender(gl, handler) {
        gl.readPixels(0, 0, this.dataset.width, this.dataset.height, gl.RGBA, gl.UNSIGNED_BYTE, this.intensities);
        this.intensityStats.max = 0;
        this.intensityStats.min = 255;
        for (let i = this.intensities.length - 1; i >= 0; i -= 4) {
            this.intensityStats.max = Math.max(this.intensities[i], this.intensityStats.max);
            this.intensityStats.min = Math.min(this.intensities[i], this.intensityStats.min);
        }
    }

    getOutputTexture() {
        return this.outputTexture;
    }

    getIntensityStats() {
        return this.intensityStats;
    }
}
