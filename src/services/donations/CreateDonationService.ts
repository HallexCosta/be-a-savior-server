import { getCustomRepository } from 'typeorm'

import { Donation } from '@entities/Donation'

import { IncidentsRepository } from '@repositories/IncidentsRepository'
import { DonorsRepository } from '@repositories/DonorsRepository'

import { DonationsRepository } from '@repositories/DonationsRepository'

import { StripeProvider } from '@providers/StripeProvider'

type CreateDonationDTO = {
  incidentId: string
  donorId: string
  amount: number
}

export class CreateDonationService {
  private readonly provider: StripeProvider

  public constructor() {
    this.provider = new StripeProvider()
  }

  public async execute({
    incidentId,
    donorId,
    amount
  }: CreateDonationDTO): Promise<Donation> {
    this.checkForFieldIsFilled({
      incidentId,
      donorId,
      amount
    })

    const incidentsRepository = getCustomRepository(IncidentsRepository)

    const incident = await incidentsRepository.findById(incidentId)

    if (!incident) {
      throw new Error('Incident not exists')
    }

    const donorsRepository = getCustomRepository(DonorsRepository)

    const donor = await donorsRepository.findById(donorId)

    if (!donor) {
      throw new Error('Donor not exists')
    }

    const donationsRepository = getCustomRepository(DonationsRepository)

    const donation = donationsRepository.create({
      incident_id: incidentId,
      donor_id: donorId
    })

    await this.provider.paymentIntents.create({
      amount,
      currency: 'brl',
      receipt_email: donor.email,
      metadata: {
        donation_id: donation.id
      }
    })

    await donationsRepository.save(donation)

    return donation
  }

  private checkForFieldIsFilled({
    incidentId,
    donorId,
    amount
  }: CreateDonationDTO): void {
    if (!incidentId) {
      throw new Error("Incident can't empty")
    }

    if (!donorId) {
      throw new Error("Donor can't empty")
    }

    if (!amount) {
      throw new Error("Amount can't empty")
    }
  }
}
