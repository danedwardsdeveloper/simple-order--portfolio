import path from 'node:path'
import express, { type Request, type Response } from 'express'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const port = process.env.PORT || 3000

app.prepare().then(() => {
	const server = express()

	server.use('/_next', express.static(path.join(__dirname, '.next')))

	server.use('/_next/image', (req: Request, res: Response) => {
		handle(req, res)
	})

	server.all('*', (req: Request, res: Response) => {
		return handle(req, res)
	})

	server.listen(port, (err?: Error) => {
		if (err) throw err
	})
})

process.on('uncaughtException', (_err: Error) => {
	process.exit(1)
})

process.on('unhandledRejection', (_reason: unknown) => {
	process.exit(1)
})
