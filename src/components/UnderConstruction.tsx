import { imagesCollection } from '@/library/imagesCollection'
import Image from 'next/image'

export default function UnderConstruction() {
	const { src, alt } = imagesCollection.underConstruction
	return (
		<div>
			<p className="mb-8">Sorry, this part of the demo is under construction</p>
			<Image src={src} alt={alt} className="max-w-xl w-full rounded-md" />
		</div>
	)
}
